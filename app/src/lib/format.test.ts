import { formatClock, formatMinutes, formatQuantity } from './format';

describe('formatQuantity', () => {
  it('uses fractions for spoons, cups and counted items', () => {
    expect(formatQuantity(0.5, 'tsp')).toBe('½ tsp');
    expect(formatQuantity(1.5, 'cup')).toBe('1½ cups');
    expect(formatQuantity(0.33, 'cup')).toBe('⅓ cup');
    expect(formatQuantity(2, '')).toBe('2');
    expect(formatQuantity(2.75, 'tbsp')).toBe('2¾ tbsp');
    expect(formatQuantity(0.98, 'tsp')).toBe('1 tsp');
  });

  it('rounds metric amounts sensibly and switches to kg / l', () => {
    expect(formatQuantity(123, 'g')).toBe('125 g');
    expect(formatQuantity(1500, 'g')).toBe('1.5 kg');
    expect(formatQuantity(2.25, 'g')).toBe('2.3 g');
    expect(formatQuantity(1000, 'ml')).toBe('1 l');
  });

  it('returns an empty string for "to taste"', () => {
    expect(formatQuantity(null, '')).toBe('');
    expect(formatQuantity(0, 'g')).toBe('');
  });
});

describe('time formatting', () => {
  it('formats clocks and durations', () => {
    expect(formatClock(75)).toBe('1:15');
    expect(formatClock(3725)).toBe('1:02:05');
    expect(formatMinutes(45)).toBe('45 min');
    expect(formatMinutes(90)).toBe('1 h 30 min');
    expect(formatMinutes(120)).toBe('2 h');
  });
});
