import { SETTINGS } from '@/config';
import { t, getLanguage, setLanguage } from '@/i18n';

interface SliderConfig {
  labelKey: keyof typeof import('@/i18n').translations.zh;
  min: number;
  max: number;
  step: number;
  getValue: () => number;
  setValue: (v: number) => void;
  format?: (v: number) => string;
}

interface ToggleConfig {
  labelKey: keyof typeof import('@/i18n').translations.zh;
  getValue: () => boolean;
  setValue: (v: boolean) => void;
}

export class ControlPanel {
  x: number;
  y: number;
  width: number = 180;

  // 蚂蚁数量变化回调
  onAntCountChange: ((count: number) => void) | null = null;

  private sliders: SliderConfig[] = [];
  private toggles: ToggleConfig[] = [];
  private draggingSlider: number = -1;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;

    // 速度滑块
    this.sliders.push({
      labelKey: 'speed',
      min: 0.5,
      max: 5,
      step: 0.5,
      getValue: () => SETTINGS.simulationSpeed,
      setValue: (v) => { SETTINGS.simulationSpeed = v; },
    });

    // 蚂蚁数量滑块
    this.sliders.push({
      labelKey: 'ants',
      min: 100,
      max: 5000,
      step: 100,
      getValue: () => SETTINGS.antCount,
      setValue: (v) => {
        SETTINGS.antCount = v;
        if (this.onAntCountChange) {
          this.onAntCountChange(v);
        }
      },
      format: (v) => v.toFixed(0),
    });

    // 信息素显示开关
    this.toggles.push({
      labelKey: 'showPheromones',
      getValue: () => SETTINGS.showPheromones,
      setValue: (v) => { SETTINGS.showPheromones = v; },
    });
  }

  private toggleLanguage(): void {
    const current = getLanguage();
    setLanguage(current === 'zh' ? 'en' : 'zh');
  }

  render(ctx: CanvasRenderingContext2D): void {
    const padding = 10;
    const lineHeight = 35;
    // 额外空间给语言按钮
    const totalHeight = padding * 2 + (this.sliders.length + this.toggles.length + 1) * lineHeight;

    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(this.x, this.y, this.width, totalHeight);

    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    let yOffset = this.y + padding;

    // 渲染滑块
    for (let i = 0; i < this.sliders.length; i++) {
      const slider = this.sliders[i];
      const value = slider.getValue();
      const displayValue = slider.format ? slider.format(value) : value.toFixed(1);
      const label = t(slider.labelKey);

      // 标签
      ctx.fillStyle = '#fff';
      ctx.fillText(`${label}: ${displayValue}`, this.x + padding, yOffset + 8);

      // 滑块轨道
      const trackX = this.x + padding;
      const trackY = yOffset + 20;
      const trackWidth = this.width - padding * 2;
      const trackHeight = 6;

      ctx.fillStyle = '#444';
      ctx.fillRect(trackX, trackY, trackWidth, trackHeight);

      // 滑块位置
      const ratio = (value - slider.min) / (slider.max - slider.min);
      const handleX = trackX + ratio * trackWidth;

      ctx.fillStyle = '#4a9eff';
      ctx.beginPath();
      ctx.arc(handleX, trackY + trackHeight / 2, 8, 0, Math.PI * 2);
      ctx.fill();

      yOffset += lineHeight;
    }

    // 渲染开关
    for (let i = 0; i < this.toggles.length; i++) {
      const toggle = this.toggles[i];
      const value = toggle.getValue();
      const label = t(toggle.labelKey);

      // 开关框
      const boxX = this.x + padding;
      const boxY = yOffset + 5;
      const boxSize = 20;

      ctx.fillStyle = value ? '#4a9eff' : '#444';
      ctx.fillRect(boxX, boxY, boxSize, boxSize);

      if (value) {
        ctx.fillStyle = '#fff';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('✓', boxX + boxSize / 2, boxY + boxSize / 2 + 1);
        ctx.textAlign = 'left';
        ctx.font = '12px monospace';
      }

      // 标签
      ctx.fillStyle = '#fff';
      ctx.fillText(label, boxX + boxSize + 8, boxY + boxSize / 2);

      yOffset += lineHeight;
    }

    // 语言切换按钮
    const langBtnX = this.x + padding;
    const langBtnY = yOffset + 5;
    const langBtnWidth = this.width - padding * 2;
    const langBtnHeight = 24;
    const currentLang = getLanguage();

    ctx.fillStyle = '#4a4a6a';
    ctx.fillRect(langBtnX, langBtnY, langBtnWidth, langBtnHeight);

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${t('language')}: ${currentLang === 'zh' ? '中文' : 'EN'}`,
      langBtnX + langBtnWidth / 2,
      langBtnY + langBtnHeight / 2
    );
    ctx.textAlign = 'left';
  }

  handleMouseDown(screenX: number, screenY: number): boolean {
    const padding = 10;
    const lineHeight = 35;

    // 检查滑块
    for (let i = 0; i < this.sliders.length; i++) {
      const trackY = this.y + padding + i * lineHeight + 20;

      if (screenY >= trackY - 10 && screenY <= trackY + 16) {
        if (screenX >= this.x && screenX <= this.x + this.width) {
          this.draggingSlider = i;
          this.updateSliderValue(screenX, i);
          return true;
        }
      }
    }

    // 检查开关
    const toggleStartY = this.y + padding + this.sliders.length * lineHeight;
    for (let i = 0; i < this.toggles.length; i++) {
      const boxY = toggleStartY + i * lineHeight + 5;

      if (
        screenX >= this.x + padding &&
        screenX <= this.x + padding + 20 &&
        screenY >= boxY &&
        screenY <= boxY + 20
      ) {
        const toggle = this.toggles[i];
        toggle.setValue(!toggle.getValue());
        return true;
      }
    }

    // 检查语言按钮
    const langBtnY = toggleStartY + this.toggles.length * lineHeight + 5;
    const langBtnHeight = 24;
    if (
      screenX >= this.x + padding &&
      screenX <= this.x + this.width - padding &&
      screenY >= langBtnY &&
      screenY <= langBtnY + langBtnHeight
    ) {
      this.toggleLanguage();
      return true;
    }

    return false;
  }

  handleMouseMove(screenX: number, _screenY: number): boolean {
    if (this.draggingSlider >= 0) {
      this.updateSliderValue(screenX, this.draggingSlider);
      return true;
    }
    return false;
  }

  handleMouseUp(): void {
    this.draggingSlider = -1;
  }

  private updateSliderValue(screenX: number, sliderIndex: number): void {
    const slider = this.sliders[sliderIndex];
    const padding = 10;
    const trackX = this.x + padding;
    const trackWidth = this.width - padding * 2;

    let ratio = (screenX - trackX) / trackWidth;
    ratio = Math.max(0, Math.min(1, ratio));

    const rawValue = slider.min + ratio * (slider.max - slider.min);
    const steppedValue = Math.round(rawValue / slider.step) * slider.step;
    slider.setValue(Math.max(slider.min, Math.min(slider.max, steppedValue)));
  }

  isOverPanel(screenX: number, screenY: number): boolean {
    const padding = 10;
    const lineHeight = 35;
    // +1 for language button
    const totalHeight = padding * 2 + (this.sliders.length + this.toggles.length + 1) * lineHeight;

    return (
      screenX >= this.x &&
      screenX <= this.x + this.width &&
      screenY >= this.y &&
      screenY <= this.y + totalHeight
    );
  }
}
