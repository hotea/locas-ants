import { t } from '@/i18n';

export type ToolType = 'pan' | 'block' | 'grass' | 'cave' | 'food' | 'portal' | 'remove';

interface ToolButton {
  type: ToolType;
  labelKey: keyof typeof import('@/i18n').translations.zh;
  color: string;
  shortcut: string;
}

export class ToolPanel {
  x: number = 10;
  y: number = 10;
  buttonWidth: number = 70;
  buttonHeight: number = 30;
  buttonGap: number = 5;

  selectedTool: ToolType = 'pan';

  private buttons: ToolButton[] = [
    { type: 'pan', labelKey: 'pan', color: '#4a6a8a', shortcut: '1' },
    { type: 'block', labelKey: 'block', color: '#5a5a7a', shortcut: '2' },
    { type: 'grass', labelKey: 'grass', color: '#3a5a3a', shortcut: '3' },
    { type: 'cave', labelKey: 'cave', color: '#c89650', shortcut: '4' },
    { type: 'food', labelKey: 'food', color: '#7ec850', shortcut: '5' },
    { type: 'portal', labelKey: 'portal', color: '#ff6b6b', shortcut: '6' },
    { type: 'remove', labelKey: 'remove', color: '#aa4444', shortcut: '7' },
  ];

  private pendingPortal: { x: number; y: number } | null = null;

  render(ctx: CanvasRenderingContext2D): void {
    for (let i = 0; i < this.buttons.length; i++) {
      const button = this.buttons[i];
      const bx = this.x;
      const by = this.y + i * (this.buttonHeight + this.buttonGap);

      const isSelected = this.selectedTool === button.type;

      ctx.fillStyle = isSelected ? '#fff' : button.color;
      ctx.fillRect(bx, by, this.buttonWidth, this.buttonHeight);

      if (isSelected) {
        ctx.fillStyle = button.color;
        ctx.fillRect(bx + 2, by + 2, this.buttonWidth - 4, this.buttonHeight - 4);
      }

      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        `${button.shortcut}:${t(button.labelKey)}`,
        bx + this.buttonWidth / 2,
        by + this.buttonHeight / 2
      );
    }
  }

  handleClick(screenX: number, screenY: number): boolean {
    for (let i = 0; i < this.buttons.length; i++) {
      const bx = this.x;
      const by = this.y + i * (this.buttonHeight + this.buttonGap);

      if (
        screenX >= bx &&
        screenX <= bx + this.buttonWidth &&
        screenY >= by &&
        screenY <= by + this.buttonHeight
      ) {
        this.selectedTool = this.buttons[i].type;
        return true;
      }
    }
    return false;
  }

  handleKey(key: string): boolean {
    const button = this.buttons.find((b) => b.shortcut === key);
    if (button) {
      this.selectedTool = button.type;
      return true;
    }
    return false;
  }

  isOverPanel(screenX: number, screenY: number): boolean {
    const totalHeight =
      this.buttons.length * (this.buttonHeight + this.buttonGap) - this.buttonGap;

    return (
      screenX >= this.x &&
      screenX <= this.x + this.buttonWidth &&
      screenY >= this.y &&
      screenY <= this.y + totalHeight
    );
  }

  setPendingPortal(x: number, y: number): void {
    this.pendingPortal = { x, y };
  }

  getPendingPortal(): { x: number; y: number } | null {
    return this.pendingPortal;
  }

  clearPendingPortal(): void {
    this.pendingPortal = null;
  }
}
