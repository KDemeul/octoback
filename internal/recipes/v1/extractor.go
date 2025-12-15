package v1

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/kiliandbigblue/octoback/internal/x/openai"
)

// ParsedRecipe represents a recipe parsed from web content.
type ParsedRecipe struct {
	Name            string             `json:"name"`
	Description     string             `json:"description"`
	Servings        int32              `json:"servings"`
	PrepTimeMinutes int32              `json:"prep_time_minutes"`
	CookTimeMinutes int32              `json:"cook_time_minutes"`
	Ingredients     []ParsedIngredient `json:"ingredients"`
}

// ParsedIngredient represents an ingredient parsed from web content.
type ParsedIngredient struct {
	Name     string `json:"name"`
	Quantity int32  `json:"quantity"`
	Unit     string `json:"unit"`
}

// RecipeExtractor extracts recipe data from web pages using AI.
type RecipeExtractor struct {
	openaiClient *openai.Client
	httpClient   *http.Client
}

// NewRecipeExtractor creates a new recipe extractor.
func NewRecipeExtractor(openaiClient *openai.Client) *RecipeExtractor {
	return &RecipeExtractor{
		openaiClient: openaiClient,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// ExtractFromURL extracts recipe data from a web URL.
func (e *RecipeExtractor) ExtractFromURL(ctx context.Context, url string) (*ParsedRecipe, error) {
	// Fetch the web page content
	content, err := e.fetchPage(ctx, url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch page: %w", err)
	}

	// Extract recipe using OpenAI
	recipe, err := e.extractWithAI(ctx, content)
	if err != nil {
		return nil, fmt.Errorf("failed to extract recipe: %w", err)
	}

	return recipe, nil
}

// fetchPage fetches and returns the text content of a web page.
func (e *RecipeExtractor) fetchPage(ctx context.Context, url string) (string, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	// Set a reasonable user agent
	req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; OctoPlanner/1.0; Recipe Importer)")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
	req.Header.Set("Accept-Language", "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7")

	resp, err := e.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to fetch URL: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("server returned status %d", resp.StatusCode)
	}

	// Read the response body with a size limit (5MB)
	limitedReader := io.LimitReader(resp.Body, 5*1024*1024)
	body, err := io.ReadAll(limitedReader)
	if err != nil {
		return "", fmt.Errorf("failed to read response: %w", err)
	}

	return string(body), nil
}

// extractJSONLD tries to extract JSON-LD recipe data from HTML.
func extractJSONLD(html string) string {
	// Look for JSON-LD script tags containing recipe data
	start := strings.Index(html, `<script type="application/ld+json">`)
	if start == -1 {
		return ""
	}
	start += len(`<script type="application/ld+json">`)
	end := strings.Index(html[start:], `</script>`)
	if end == -1 {
		return ""
	}
	jsonLD := html[start : start+end]
	// Check if it contains recipe data
	if strings.Contains(jsonLD, "Recipe") || strings.Contains(jsonLD, "recipeIngredient") {
		return jsonLD
	}
	return ""
}

// extractWithAI uses OpenAI to extract recipe data from HTML content.
func (e *RecipeExtractor) extractWithAI(ctx context.Context, htmlContent string) (*ParsedRecipe, error) {
	// Try to extract JSON-LD first as it's usually more complete
	jsonLD := extractJSONLD(htmlContent)

	// Truncate content if too long to fit in context
	maxContentLength := 50000
	if len(htmlContent) > maxContentLength {
		htmlContent = htmlContent[:maxContentLength]
	}

	// If we found JSON-LD, prepend it to help the AI
	if jsonLD != "" {
		htmlContent = "STRUCTURED DATA (JSON-LD) - USE THIS FOR INGREDIENTS:\n" + jsonLD + "\n\nFULL HTML:\n" + htmlContent
	}

	prompt := fmt.Sprintf(`You are analyzing a recipe webpage. Extract the ACTUAL recipe information from the HTML below.

CRITICAL RULES:
1. Extract EVERY SINGLE ingredient - do not skip any
2. Look carefully for ingredient data in JSON-LD structured data, schema.org markup, or ingredient lists
3. Search for patterns like "recipeIngredient", "ingredients", class names containing "ingredient"
4. Include ALL spices, herbs, oils, seasonings - nothing should be omitted

Return a JSON object with this structure:
{
  "name": "The actual recipe name from the page",
  "description": "A brief description based on the recipe content",
  "servings": <number of servings>,
  "prep_time_minutes": <preparation time in minutes>,
  "cook_time_minutes": <cooking time in minutes>,
  "ingredients": [
    {"name": "<ingredient name>", "quantity": <number>, "unit": "<unit>"},
    ...include ALL ingredients...
  ]
}

Parsing rules:
- Extract EVERY ingredient, even optional ones (mark them in the name if needed)
- Round decimal quantities: 0.5 becomes 1, 1.5 becomes 2
- Keep French units: g, ml, kg, L, c.s. (cuillère à soupe), c.c. (cuillère à café), gousse, pincée, branche, feuille
- If no quantity specified, use 1
- For countable items without unit, use empty string ""
- Common French abbreviations: c.s. = cuillère à soupe, c.c. = cuillère à café

Return ONLY valid JSON, no explanations.

HTML Content:
%s`, htmlContent)

	resp, err := e.openaiClient.ChatCompletion(ctx, openai.ChatRequest{
		Model: "gpt-4o-mini",
		Messages: []openai.Message{
			{
				Role:    "system",
				Content: "You are a recipe extraction expert. You extract COMPLETE ingredient lists from webpages. You NEVER skip ingredients. You always respond with valid JSON.",
			},
			{
				Role:    "user",
				Content: prompt,
			},
		},
		Temperature: 0.1,
		MaxTokens:   4000,
	})
	if err != nil {
		return nil, fmt.Errorf("openai request failed: %w", err)
	}

	if len(resp.Choices) == 0 {
		return nil, fmt.Errorf("no response from OpenAI")
	}

	content := resp.Choices[0].Message.Content
	// Clean up the response - remove markdown code blocks if present
	content = strings.TrimPrefix(content, "```json")
	content = strings.TrimPrefix(content, "```")
	content = strings.TrimSuffix(content, "```")
	content = strings.TrimSpace(content)

	var recipe ParsedRecipe
	if err := json.Unmarshal([]byte(content), &recipe); err != nil {
		return nil, fmt.Errorf("failed to parse AI response as JSON: %w (response: %s)", err, content)
	}

	// Apply defaults for missing values
	if recipe.Servings <= 0 {
		recipe.Servings = 4
	}
	if recipe.PrepTimeMinutes < 0 {
		recipe.PrepTimeMinutes = 0
	}
	if recipe.CookTimeMinutes < 0 {
		recipe.CookTimeMinutes = 0
	}

	return &recipe, nil
}

// IsConfigured returns true if the extractor has a configured OpenAI client.
func (e *RecipeExtractor) IsConfigured() bool {
	return e.openaiClient != nil && e.openaiClient.IsConfigured()
}
