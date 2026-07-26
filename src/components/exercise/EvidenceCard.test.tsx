import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EvidenceCard } from './EvidenceCard';
import type { ForensicEvent } from '../../types/case';

function makeEvent(overrides: Partial<ForensicEvent> = {}): ForensicEvent {
  return {
    id: 'evt-1',
    timestamp: '2024-09-14T10:15:33.000Z',
    type: 'history',
    description: 'Visited the Jira ticket page',
    correctOrder: 1,
    isRelevant: true,
    explanation: 'A Jira ticket visit.',
    relationships: [
      { type: 'before', targetEventId: 'evt-2', label: 'Jira precedes a search.' },
      { type: 'after', targetEventId: 'evt-0', label: 'This followed earlier activity.' },
    ],
    hints: [
      'Think about which event usually anchors a deployment-related investigation.',
      'A Jira ticket for a production release may drive related research activity elsewhere.',
      'The Chrome Jira ticket visit should be placed first.',
    ],
    ...overrides,
  };
}

describe('EvidenceCard', () => {
  it('renders the timestamp, type badge, and description by default', () => {
    render(<EvidenceCard event={makeEvent()} />);

    expect(
      screen.getByText('Visited the Jira ticket page'),
    ).toBeInTheDocument();
    // EventTypeBadge shows the type as a human-readable label.
    expect(screen.getByText('History')).toBeInTheDocument();
    // Timestamp is rendered via <time> when showTimestamp is true.
    expect(screen.getByRole('time')).toBeInTheDocument();
  });

  it('hides the timestamp when showTimestamp is false (advanced mode)', () => {
    render(<EvidenceCard event={makeEvent()} showTimestamp={false} />);

    expect(screen.queryByRole('time')).not.toBeInTheDocument();
  });

  it('NEVER renders relationship context inline (only the HintPanel may show it)', () => {
    // The "Context:" prefix + joined relationship labels is the previous
    // behaviour we just removed. Make sure it does not creep back in.
    const { container } = render(<EvidenceCard event={makeEvent()} />);
    const text = container.textContent ?? '';

    expect(text).not.toContain('Context:');
    expect(text).not.toContain('Jira precedes a search.');
    expect(text).not.toContain('This followed earlier activity.');
  });

  it('NEVER renders the hint list inline (only the HintPanel may reveal hints)', () => {
    // The previous behaviour dumped every hint in a <ul> on the card itself,
    // which defeats the progressive-hint design.
    const { container } = render(<EvidenceCard event={makeEvent()} />);
    const text = container.textContent ?? '';

    expect(text).not.toContain('Think about which event usually anchors');
    expect(text).not.toContain('A Jira ticket for a production release');
    expect(text).not.toContain('The Chrome Jira ticket visit should be placed first.');
    expect(container.querySelector('ul')).toBeNull();
  });

  it('NEVER shows the explanation text inline', () => {
    const { container } = render(<EvidenceCard event={makeEvent()} />);
    const text = container.textContent ?? '';

    // The explanation is shown only on the Results page.
    expect(text).not.toContain('A Jira ticket visit.');
  });

  it('does not accept a `mode` prop any more (the prop has been removed)', () => {
    // The mode prop previously drove the advanced-clue behaviour we just
    // removed. TypeScript would catch a regression at the call site; this
    // runtime check is a belt-and-braces guard for the rendered output.
    const { container } = render(<EvidenceCard event={makeEvent()} />);
    const text = container.textContent ?? '';

    // The card should only contain the timestamp, type label, and description.
    expect(text).toContain('Visited the Jira ticket page');
    // None of the advanced-mode decorations.
    expect(text).not.toContain('Context:');
    expect(container.querySelectorAll('ul').length).toBe(0);
  });
});
