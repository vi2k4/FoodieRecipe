import { PromptBuilderService } from './prompt-builder.service';

describe('PromptBuilderService', () => {
  const service = new PromptBuilderService();

  it('requires detected ingredient names to be translated to Vietnamese', () => {
    const prompt = service.buildRecipePrompt([
      { name: 'Tomato', confidence: 98.5 },
      { name: 'Green Onion', confidence: 91 },
    ]);

    expect(prompt).toContain('- Tomato (98.5%)');
    expect(prompt).toContain('- Green Onion (91%)');
    expect(prompt).toContain('"detectedIngredients"');
    expect(prompt).toContain(
      'Every "detectedIngredients[].name" MUST be Vietnamese',
    );
    expect(prompt).toContain('"sourceName" MUST be copied exactly');
  });
});
