/**
 * Card Accordion System for Featured Projects and Arsenal Skills.
 * - Hides wordy content by default.
 * - Reveals wordy content on hover.
 * - Persists expanded state on single click.
 * - Retracts / collapses on double click.
 * - Clears retraction state on mouseleave so subsequent hovers re-expand cleanly.
 * - Ignores clicks targeting nested interactive controls (links, buttons).
 * - Full lifecycle support for DOM ready and Astro view transitions.
 */

const DOUBLE_CLICK_THRESHOLD = 260; // ms

export function initCardAccordions(): void {
  const cards = document.querySelectorAll<HTMLElement>('.project-row, .skill-card');
  if (!cards.length) return;

  cards.forEach((card) => {
    if (card.dataset.accordionBound === 'true') return;
    card.dataset.accordionBound = 'true';

    let clickTimer: ReturnType<typeof setTimeout> | null = null;

    const onSingleClick = () => {
      card.classList.remove('is-retracted');
      card.classList.add('is-persisted');
    };

    const onDoubleClick = () => {
      card.classList.remove('is-persisted');
      card.classList.add('is-retracted');
    };

    card.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('a, button, input')) {
        return;
      }

      if (clickTimer !== null) {
        clearTimeout(clickTimer);
        clickTimer = null;
        onDoubleClick();
      } else {
        clickTimer = setTimeout(() => {
          clickTimer = null;
          onSingleClick();
        }, DOUBLE_CLICK_THRESHOLD);
      }
    });

    card.addEventListener('dblclick', (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('a, button, input')) {
        return;
      }
      if (clickTimer !== null) {
        clearTimeout(clickTimer);
        clickTimer = null;
      }
      onDoubleClick();
    });

    card.addEventListener('mousemove', (event: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('is-retracted');
    });
  });
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initCardAccordions());
  } else {
    initCardAccordions();
  }
  document.addEventListener('astro:page-load', () => initCardAccordions());
}
