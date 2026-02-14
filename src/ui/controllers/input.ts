interface InputControllerOptions {
  input: HTMLInputElement;
  adjustableNumbers: boolean;
  onValueChange: (value: string) => boolean;
  onCommit: () => void;
}

/**
 * Public API of the input controller.
 */
export interface InputController {
  setValue(value: string): void;
  destroy(): void;
}

const updateNumberNearCursor = (value: string, cursor: number, delta: number): { value: string; cursor: number } => {
  const matcher = /-?\d*\.?\d+/g;
  let match = matcher.exec(value);

  while (match) {
    const start = match.index;
    const end = start + match[0].length;

    if (cursor >= start && cursor <= end) {
      const current = Number.parseFloat(match[0]);
      if (!Number.isFinite(current)) {
        return { value, cursor };
      }

      const next = (Math.round((current + delta) * 1000) / 1000).toString();
      const updated = `${value.slice(0, start)}${next}${value.slice(end)}`;
      return { value: updated, cursor: start + next.length };
    }

    match = matcher.exec(value);
  }

  return { value, cursor };
};

/**
 * Creates the text input controller used for manual color entry.
 *
 * @param options Input element and callbacks for validation/commit behavior.
 * @returns Controller for external value sync and teardown.
 */
export const createInputController = ({
  input,
  adjustableNumbers,
  onValueChange,
  onCommit
}: InputControllerOptions): InputController => {
  const handleInput = (): void => {
    const valid = onValueChange(input.value);
    input.classList.toggle('is-invalid', !valid);
  };

  const handleBlur = (): void => {
    input.classList.remove('is-invalid');
    onCommit();
  };

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Enter') {
      onCommit();
      return;
    }

    if (!adjustableNumbers || event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
      return;
    }

    const cursor = input.selectionStart ?? input.value.length;
    const step = event.shiftKey ? 1 : event.altKey ? 0.01 : 0.1;
    const delta = event.key === 'ArrowUp' ? step : -step;
    const next = updateNumberNearCursor(input.value, cursor, delta);

    input.value = next.value;
    input.setSelectionRange(next.cursor, next.cursor);
    handleInput();
    event.preventDefault();
  };

  input.addEventListener('input', handleInput);
  input.addEventListener('blur', handleBlur);
  input.addEventListener('keydown', handleKeyDown);

  return {
    setValue(value: string): void {
      input.value = value;
      input.classList.remove('is-invalid');
    },
    destroy(): void {
      input.removeEventListener('input', handleInput);
      input.removeEventListener('blur', handleBlur);
      input.removeEventListener('keydown', handleKeyDown);
    }
  };
};
