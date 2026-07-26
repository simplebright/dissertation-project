import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { DragEndEvent } from '@dnd-kit/core';
import { useContainerDnd, type ContainerState } from './useContainerDnd';
import { DND_CONTAINER_IDS } from '../constants/dnd';

const { evidence: EVIDENCE, timeline: TIMELINE } = DND_CONTAINER_IDS;

function makeDragEnd(activeId: string, overId: string | null): DragEndEvent {
  return {
    active: { id: activeId } as DragEndEvent['active'],
    over: overId === null ? null : ({ id: overId } as DragEndEvent['over']),
  } as DragEndEvent;
}

function makeInitialState(): ContainerState {
  return {
    [EVIDENCE]: ['e1', 'e2', 'e3'],
    [TIMELINE]: [],
  };
}

describe('useContainerDnd', () => {
  it('initialises containers from the supplied state', () => {
    const { result } = renderHook(() => useContainerDnd(makeInitialState(), 'case-1'));

    expect(result.current.containers).toEqual({
      [EVIDENCE]: ['e1', 'e2', 'e3'],
      [TIMELINE]: [],
    });
  });

  it('moves an item from evidence to timeline when dropped on the timeline container', () => {
    const { result } = renderHook(() => useContainerDnd(makeInitialState(), 'case-1'));

    act(() => {
      result.current.handleDragEnd(makeDragEnd('e2', TIMELINE));
    });

    expect(result.current.containers[EVIDENCE]).toEqual(['e1', 'e3']);
    expect(result.current.containers[TIMELINE]).toEqual(['e2']);
  });

  it('moves an item from timeline back to evidence when dropped on the evidence container', () => {
    const initial: ContainerState = {
      [EVIDENCE]: ['e1', 'e3'],
      [TIMELINE]: ['e2'],
    };
    const { result } = renderHook(() => useContainerDnd(initial, 'case-1'));

    act(() => {
      result.current.handleDragEnd(makeDragEnd('e2', EVIDENCE));
    });

    expect(result.current.containers[EVIDENCE]).toEqual(['e1', 'e3', 'e2']);
    expect(result.current.containers[TIMELINE]).toEqual([]);
  });

  it('reorders items within the same container when dropped on another item', () => {
    const { result } = renderHook(() => useContainerDnd(makeInitialState(), 'case-1'));

    // Move e3 before e1 within evidence.
    act(() => {
      result.current.handleDragEnd(makeDragEnd('e3', 'e1'));
    });

    expect(result.current.containers[EVIDENCE]).toEqual(['e3', 'e1', 'e2']);
  });

  it('drops into a specific empty slot in the timeline', () => {
    const initial: ContainerState = {
      [EVIDENCE]: ['e1', 'e2', 'e3'],
      [TIMELINE]: ['t1'],
    };
    const { result } = renderHook(() => useContainerDnd(initial, 'case-1'));

    // Drop e1 onto empty-slot-2 (timeline has 1 item, slot 2 -> index 1).
    act(() => {
      result.current.handleDragEnd(makeDragEnd('e1', 'empty-slot-2'));
    });

    expect(result.current.containers[TIMELINE]).toEqual(['t1', 'e1']);
    expect(result.current.containers[EVIDENCE]).toEqual(['e2', 'e3']);
  });

  it('clamps an empty-slot drop past the current length to append', () => {
    const initial: ContainerState = {
      [EVIDENCE]: ['e1', 'e2', 'e3'],
      [TIMELINE]: ['t1'],
    };
    const { result } = renderHook(() => useContainerDnd(initial, 'case-1'));

    // Empty-slot-5 -> clamped to end of timeline (length 1).
    act(() => {
      result.current.handleDragEnd(makeDragEnd('e1', 'empty-slot-5'));
    });

    expect(result.current.containers[TIMELINE]).toEqual(['t1', 'e1']);
  });

  it('does nothing when the item is dropped outside any container', () => {
    const { result } = renderHook(() => useContainerDnd(makeInitialState(), 'case-1'));

    act(() => {
      result.current.handleDragEnd(makeDragEnd('e1', null));
    });

    expect(result.current.containers).toEqual(makeInitialState());
  });

  it('does nothing when the active item is not in any container', () => {
    const { result } = renderHook(() => useContainerDnd(makeInitialState(), 'case-1'));

    act(() => {
      result.current.handleDragEnd(makeDragEnd('ghost', TIMELINE));
    });

    expect(result.current.containers).toEqual(makeInitialState());
  });

  it('does nothing when dropped on itself within the same container', () => {
    const { result } = renderHook(() => useContainerDnd(makeInitialState(), 'case-1'));

    act(() => {
      result.current.handleDragEnd(makeDragEnd('e2', 'e2'));
    });

    expect(result.current.containers[EVIDENCE]).toEqual(['e1', 'e2', 'e3']);
  });

  it('resets containers when the resetKey changes', () => {
    const initialA: ContainerState = {
      [EVIDENCE]: ['a1', 'a2'],
      [TIMELINE]: ['a3'],
    };
    const initialB: ContainerState = {
      [EVIDENCE]: ['b1'],
      [TIMELINE]: [],
    };

    const { result, rerender } = renderHook(
      ({ state, resetKey }: { state: ContainerState; resetKey: string }) =>
        useContainerDnd(state, resetKey),
      { initialProps: { state: initialA, resetKey: 'case-A' } },
    );

    expect(result.current.containers).toEqual(initialA);

    // Mutate via drag end.
    act(() => {
      result.current.handleDragEnd(makeDragEnd('a1', TIMELINE));
    });
    expect(result.current.containers[TIMELINE]).toEqual(['a3', 'a1']);

    // Switch to a different case / resetKey.
    rerender({ state: initialB, resetKey: 'case-B' });

    expect(result.current.containers).toEqual(initialB);
  });
});
