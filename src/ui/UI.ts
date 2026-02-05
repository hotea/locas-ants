import { Game } from '@/core/Game';
import { ToolPanel } from './ToolPanel';
import { ControlPanel } from './ControlPanel';
import { t, getLanguage } from '@/i18n';
import { Cave } from '@/cells/Cave';

export class UI {
  game: Game;
  toolPanel: ToolPanel;
  controlPanel: ControlPanel;

  constructor(game: Game) {
    this.game = game;
    this.toolPanel = new ToolPanel();
    this.controlPanel = new ControlPanel(game.renderer.width - 190, 80);
  }

  updateLayout(): void {
    this.controlPanel.x = this.game.renderer.width - 190;
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.updateLayout();
    this.toolPanel.render(ctx);
    this.controlPanel.render(ctx);
    this.renderStats(ctx);
    this.renderHelp(ctx);
  }

  private renderStats(ctx: CanvasRenderingContext2D): void {
    const x = this.game.renderer.width - 130;
    const y = 20;

    // 获取收集的食物数量
    const cave = this.game.grid.cells.find((c) => c.type === 'cave') as Cave | undefined;
    const deposited = cave ? cave.foodStored : 0;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x - 10, y - 15, 130, 75);

    ctx.fillStyle = '#fff';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    ctx.fillText(`${t('fps')}: ${this.game.fps}`, x, y);
    ctx.fillText(`${t('antCount')}: ${this.game.ants.length}`, x, y + 20);
    ctx.fillText(`${t('deposited')}: ${deposited}`, x, y + 40);
  }

  private renderHelp(ctx: CanvasRenderingContext2D): void {
    const x = 10;
    const y = this.game.renderer.height - 30;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x - 5, y - 5, 350, 25);

    ctx.fillStyle = '#aaa';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const helpText = getLanguage() === 'zh'
      ? '拖动: 平移 | 滚轮: 缩放 | 点击: 使用工具'
      : 'Drag: pan | Scroll: zoom | Click: use tool';
    ctx.fillText(helpText, x, y);
  }
}
