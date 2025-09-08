
async function researchPipeline(userQuery) {
  // 1. Plan
  const subQs = await planner(userQuery);

  // 2. Search
  const searchResults = [];
  
  // 3. Rank
  const ranked = await rankerNode(searchResults);

  // 4. Write ranker node
  const finalAnswer = await writerNode(userQuery, ranked);

  return finalAnswer;
}
