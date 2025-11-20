const ELEMENT_TAG = 'mfe1-shared-timer';

const formatElapsed = (value) => {
  const totalMilliseconds = Math.max(0, Math.floor(value));
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  const tenths = Math.floor((totalMilliseconds % 1000) / 100);
  return `${minutes}:${seconds}.${tenths}`;
};

export const ensureTimerElement = () => {
  if (customElements.get(ELEMENT_TAG)) {
    return;
  }

  class SharedTimerElement extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.elapsedMs = 0;
      this.running = false;
      this.intervalId = null;
      this.lastTick = null;
      this.render();
      this.update();
    }

    connectedCallback() {
      const attrValue = Number(this.getAttribute('elapsed-ms'));
      if (!Number.isNaN(attrValue) && attrValue >= 0) {
        this.elapsedMs = attrValue;
        this.update();
      }
    }

    disconnectedCallback() {
      this.pauseTimer();
    }

    render() {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
            color: #0f172a;
          }
          .timer {
            border: 1px solid #cbd5f5;
            border-radius: 0.75rem;
            padding: 1rem 1.25rem;
            background: #f8fbff;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
          }
          .label {
            font-size: 0.875rem;
            color: #475569;
            margin: 0 0 0.25rem;
          }
          .display {
            font-size: 2rem;
            font-weight: 600;
            letter-spacing: 0.08em;
            margin-bottom: 0.75rem;
          }
          .actions {
            display: flex;
            gap: 0.75rem;
          }
          button {
            flex: 1;
            border: none;
            border-radius: 999px;
            padding: 0.5rem 0.75rem;
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s ease;
          }
          button[data-action='toggle'] {
            background: #2563eb;
            color: white;
          }
          button[data-action='toggle']:hover {
            background: #1d4fd8;
          }
          button[data-action='reset'] {
            background: #e2e8f0;
            color: #0f172a;
          }
          button[data-action='reset']:hover {
            background: #cbd5f5;
          }
        </style>
        <section class="timer">
          <p class="label">Elapsed time</p>
          <div class="display">00:00.0</div>
          <div class="actions">
            <button type="button" data-action="toggle">Start</button>
            <button type="button" data-action="reset">Reset</button>
          </div>
        </section>
      `;

      this.displayEl = this.shadowRoot.querySelector('.display');
      this.toggleButton = this.shadowRoot.querySelector('button[data-action="toggle"]');
      this.resetButton = this.shadowRoot.querySelector('button[data-action="reset"]');

      this.toggleButton.addEventListener('click', () => {
        if (this.running) {
          this.pauseTimer();
        } else {
          this.startTimer();
        }
      });

      this.resetButton.addEventListener('click', () => {
        this.resetTimer();
      });
    }

    startTimer() {
      if (this.running) {
        return;
      }

      this.running = true;
      this.lastTick = performance.now();
      this.intervalId = window.setInterval(() => this.handleTick(), 100);
      this.update();
      this.dispatchElapsed();
    }

    pauseTimer() {
      if (!this.running) {
        return;
      }

      this.running = false;
      window.clearInterval(this.intervalId);
      this.intervalId = null;
      this.lastTick = null;
      this.update();
      this.dispatchElapsed();
    }

    resetTimer() {
      this.elapsedMs = 0;
      this.update();
      this.dispatchElapsed();
    }

    handleTick() {
      const now = performance.now();
      if (this.lastTick == null) {
        this.lastTick = now;
        return;
      }

      this.elapsedMs += now - this.lastTick;
      this.lastTick = now;
      this.update();
      this.dispatchElapsed();
    }

    update() {
      if (!this.displayEl) {
        return;
      }

      this.displayEl.textContent = formatElapsed(this.elapsedMs);
      this.toggleButton.textContent = this.running ? 'Pause' : 'Start';
      this.toggleButton.setAttribute('aria-pressed', String(this.running));
    }

    dispatchElapsed() {
      this.dispatchEvent(
        new CustomEvent('elapsed-updated', {
          detail: { elapsedMs: Math.max(0, Math.floor(this.elapsedMs)) },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  customElements.define(ELEMENT_TAG, SharedTimerElement);
};
