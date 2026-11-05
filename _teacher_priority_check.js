const assert = require('node:assert/strict');
const { recommendByPriority } = require('./teacher-priority-recommendation.js');

const teacher = (name, tier, slots, score, allowed = true) => ({ name, tier, slots, score, allowed });
const recommend = (teachers, requiredLessons = 100, tiers = [1, 2, 3, 4, 5], onCoverage = () => {}) => recommendByPriority({
  tiers, teachers, requiredLessons,
  matchesRequirements: item => item.allowed,
  matchesTier: (item, tier) => item.tier === tier,
  availableLessons: item => item.slots,
  coverage: item => { onCoverage(item); return { total: item.score }; }
});

// The business example: 75% is retained, 70% is dropped, 81% is retained and stops the search.
const visited = [];
const example = recommend([
  teacher('浦西甲', 1, 70, 75), teacher('浦西乙', 1, 60, 72),
  teacher('浦东甲', 2, 80, 70),
  teacher('橡沐甲', 3, 85, 81), teacher('橡沐乙', 3, 85, 76), teacher('橡沐丙', 3, 85, 60),
  teacher('兼职甲', 4, 90, 90)
], 100, [1, 2, 3, 4], item => visited.push(item.name));
assert.deepEqual(example.groups.map(group => group.tierIndex), [0, 2]);
assert.deepEqual(example.teachers.map(item => item.name), ['浦西甲', '浦西乙', '橡沐甲', '橡沐乙']);
assert(!visited.includes('兼职甲'));

// Every teacher in a lower-priority tier must beat the last kept tier's best; then take at most four.
const lowerTierTopFour = recommend([
  teacher('上级', 1, 60, 75),
  ...[79, 78, 77, 76, 75, 60].map((score, index) => teacher(`下级${index}`, 2, 60, score))
], 100, [1, 2]);
assert.deepEqual(lowerTierTopFour.groups.map(group => group.tierIndex), [0, 1]);
assert.deepEqual(lowerTierTopFour.groups[1].teachers.map(item => item.name), ['下级0', '下级1', '下级2', '下级3']);
assert.equal(lowerTierTopFour.groups[1].qualifiedCount, 4);

// Compare each lower tier with the nearest retained upper tier, not with tier one.
const chain = recommend([
  teacher('一', 1, 50, 75), teacher('二', 2, 50, 70),
  teacher('三', 3, 50, 79), teacher('四', 4, 50, 79),
  teacher('五', 5, 50, 80)
]);
assert.deepEqual(chain.groups.map(group => group.tierIndex), [0, 2, 4]);
assert.deepEqual(chain.groups.map(group => group.bestCoverage), [75, 79, 80]);

// A tier with exactly 80% stops immediately; fewer than four teachers are not topped up from lower tiers.
const firstTier = recommend([
  teacher('甲', 1, 50, 80), teacher('乙', 1, 51, 77), teacher('丙', 1, 49, 95),
  teacher('丁', 2, 60, 99)
]);
assert.deepEqual(firstTier.groups.map(group => group.tierIndex), [0]);
assert.deepEqual(firstTier.teachers.map(item => item.name), ['甲', '乙']);

const topFour = recommend([91, 83, 95, 75, 89].map((score, index) => teacher(`T${index}`, 1, 50, score)), 100, [1, 2]);
assert.deepEqual(topFour.teachers.map(item => item.name), ['T2', 'T0', 'T4', 'T1']);

const fallback = recommend([teacher('不足', 1, 49, 90), teacher('可用', 2, 50, 65)]);
assert.deepEqual(fallback.groups.map(group => group.tierIndex), [1]);

const noOverlap = recommend([teacher('无交集', 1, 70, 0), teacher('有交集', 2, 70, 65)]);
assert.deepEqual(noOverlap.groups.map(group => group.tierIndex), [1]);

const empty = recommend([teacher('不足', 1, 49, 90)]);
assert.deepEqual(empty.groups, []);
assert.deepEqual(empty.teachers, []);

const halfBoundary = recommend([teacher('7节', 1, 7, 7), teacher('8节', 1, 8, 8)], 15, [1]);
assert.equal(halfBoundary.threshold, 8);
assert.deepEqual(halfBoundary.teachers.map(item => item.name), ['8节']);
console.log('Teacher priority checks passed');
