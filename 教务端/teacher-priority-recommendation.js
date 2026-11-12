(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.TeacherPriorityRecommendation = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';

  function recommendByPriority({ tiers, teachers, requiredLessons, matchesRequirements, matchesTier, availableLessons, coverage, limit = 4 }) {
    const required = Math.max(0, Number(requiredLessons) || 0);
    const threshold = Math.ceil(required / 2);
    const eligible = teachers.filter(matchesRequirements);
    const groups = [];
    let lastKeptBest = -1;
    for (let tierIndex = 0; tierIndex < tiers.length; tierIndex++) {
      const tier = tiers[tierIndex];
      const qualified = eligible.filter(teacher =>
        matchesTier(teacher, tier) && Number(availableLessons(teacher)) >= threshold
      );
      if (!qualified.length) continue;
      const minimumCoverage = groups.length ? lastKeptBest : 0;
      const ranked = qualified.map(teacher => ({ teacher, coverage: coverage(teacher) }))
        .filter(item => Number(item.coverage.total) > minimumCoverage);
      if (!ranked.length) continue;
      ranked.sort((left, right) => {
        const a = left.coverage, b = right.coverage;
        return (Number(b.total) || 0) - (Number(a.total) || 0)
          || (Number(a.gap) || 0) - (Number(b.gap) || 0)
          || (Number(b.fixed) || 0) - (Number(a.fixed) || 0)
          || (Number(b.preferred) || 0) - (Number(a.preferred) || 0)
          || (Number(right.teacher.preference) || 0) - (Number(left.teacher.preference) || 0)
          || String(left.teacher.name).localeCompare(String(right.teacher.name), 'zh-CN');
      });
      const bestCoverage = Number(ranked[0].coverage.total) || 0;
      const selected = ranked.slice(0, limit);
      groups.push({ tierIndex, tier, teachers: selected.map(item => item.teacher), ranked: selected, qualifiedCount: ranked.length, bestCoverage, coverageRate: required ? bestCoverage / required : 0 });
      lastKeptBest = bestCoverage;
      if (required && bestCoverage / required >= 0.8) break;
    }
    return { groups, teachers: groups.flatMap(group => group.teachers), threshold };
  }

  return { recommendByPriority };
});
