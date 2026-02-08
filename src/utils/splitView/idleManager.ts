import type { SplitViewState } from './types';

const RESUME_DELAY = 3000; // Resume floating after 3 seconds of inactivity

export interface IdleManager {
  startFloating: () => void;
  stopFloating: () => void;
  cleanup: () => void;
}

/**
 * Create an idle manager for controlling emblem floating animation
 */
export function createIdleManager(
  splitView: HTMLElement,
  state: SplitViewState
): IdleManager {
  function startFloating() {
    // Clear any pending resume timer
    if (state.resumeTimer) clearTimeout(state.resumeTimer);

    if (splitView.classList.contains('has-selection') && !state.isIdle) {
      state.isIdle = true;
      document.querySelectorAll('[data-emblem-card]').forEach(card => {
        card.dispatchEvent(new CustomEvent('emblemcard:idle-start'));
      });
    }
  }

  function stopFloating() {
    // Clear any pending resume timer
    if (state.resumeTimer) clearTimeout(state.resumeTimer);

    if (state.isIdle) {
      state.isIdle = false;
      document.querySelectorAll('[data-emblem-card]').forEach(card => {
        card.dispatchEvent(new CustomEvent('emblemcard:idle-end'));
      });
    }

    // Set timer to resume floating after inactivity
    state.resumeTimer = window.setTimeout(() => {
      startFloating();
    }, RESUME_DELAY);
  }

  function cleanup() {
    if (state.resumeTimer) {
      clearTimeout(state.resumeTimer);
      state.resumeTimer = null;
    }
  }

  return { startFloating, stopFloating, cleanup };
}

/**
 * Initialize idle event listeners (scroll, keyboard) - called once globally
 */
export function initIdleEventListeners(
  detailPanel: HTMLElement | null,
  stopFloating: () => void
): void {
  if ((window as any).__splitViewIdleHandlers) return;
  (window as any).__splitViewIdleHandlers = true;

  // Scroll detection - stops floating
  detailPanel?.addEventListener('scroll', stopFloating, { passive: true });

  // Keyboard input - stops floating
  document.addEventListener('keydown', stopFloating);
}

/**
 * Initialize emblem hover listeners (pauses floating during hover)
 */
export function initEmblemHoverListeners(
  state: SplitViewState,
  startFloating: () => void
): void {
  document.querySelectorAll('[data-emblem-card]').forEach(card => {
    card.addEventListener('mouseenter', () => {
      // Clear resume timer and pause floating during hover
      if (state.resumeTimer) clearTimeout(state.resumeTimer);
      if (state.isIdle) {
        state.isIdle = false;
        card.dispatchEvent(new CustomEvent('emblemcard:idle-end'));
      }
    });
    card.addEventListener('mouseleave', () => {
      // Resume floating immediately after hovering emblem
      startFloating();
    });
  });
}
