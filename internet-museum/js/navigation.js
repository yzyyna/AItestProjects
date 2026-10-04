/**
 * 《404 之前：互联网考古馆》- 导航与时间轴驱动模块
 * 负责横向展区滚动、手势拖拽、键盘导航与时代同步
 */

import { ERAS_CONFIG, museumStore } from './state.js';
import { audioManager } from './audio.js';

export class NavigationManager {
  constructor() {
    this.galleryEl = null;
    this.timelineNodesEl = null;
    this.timelineProgressEl = null;
    this.eraIndicatorEl = null;
    this.speedIndicatorEl = null;
    this.statusIndicatorEl = null;
    this.eggCountEl = null;

    this.eras = ERAS_CONFIG;
    this.currentIndex = 0;
    this.isProgrammaticScroll = false;
    this.scrollTimeout = null;

    // 手势拖拽状态
    this.isDragging = false;
    this.startX = 0;
    this.scrollLeftStart = 0;
  }

  init() {
    this.galleryEl = document.querySelector('.gallery');
    this.timelineNodesEl = document.querySelectorAll('.timeline-node');
    this.timelineProgressEl = document.querySelector('.timeline-progress-fill');
    this.eraIndicatorEl = document.getElementById('current-era-display');
    this.speedIndicatorEl = document.getElementById('current-speed-display');
    this.statusIndicatorEl = document.getElementById('current-status-display');
    this.eggCountEl = document.getElementById('eggs-count-display');

    if (!this.galleryEl) return;

    this.bindEvents();
    this.syncFromState();
  }

  bindEvents() {
    // 1. 监听横向滚动，使用防抖与 Intersection 检测当前时代
    this.galleryEl.addEventListener('scroll', () => {
      if (this.isProgrammaticScroll) return;
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        this.detectCurrentEraFromScroll();
      }, 60);
    }, { passive: true });

    // 2. 滚轮事件优化：垂直滚轮在展区内平滑转换为横向滚动
    this.galleryEl.addEventListener('wheel', (e) => {
      // 若处于需要纵向滚动的子面板中（如论坛回帖列表或算法卡片流），不抢夺滚轮
      const scrollableChild = e.target.closest('.inner-scrollable');
      if (scrollableChild) {
        const canScrollVertically = scrollableChild.scrollHeight > scrollableChild.clientHeight;
        if (canScrollVertically && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          return; // 允许子容器正常上下滚动
        }
      }

      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        this.galleryEl.scrollBy({
          left: e.deltaY * 1.5,
          behavior: 'auto'
        });
      }
    }, { passive: false });

    // 3. 键盘左右键切换
    window.addEventListener('keydown', (e) => {
      // 避免输入框内按左右键触发切屏
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        this.nextEra();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        this.prevEra();
      }
    });

    // 4. 鼠标指针拖拽滑动支持
    this.galleryEl.addEventListener('mousedown', (e) => {
      if (e.target.closest('button, input, textarea, a, .clickable, .draggable-item')) return;
      this.isDragging = true;
      this.startX = e.pageX - this.galleryEl.offsetLeft;
      this.scrollLeftStart = this.galleryEl.scrollLeft;
      this.galleryEl.style.cursor = 'grabbing';
      this.galleryEl.style.userSelect = 'none';
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      e.preventDefault();
      const x = e.pageX - this.galleryEl.offsetLeft;
      const walk = (x - this.startX) * 1.2;
      this.galleryEl.scrollLeft = this.scrollLeftStart - walk;
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.galleryEl.style.cursor = '';
        this.galleryEl.style.removeProperty('user-select');
        this.snapToNearestEra();
      }
    });

    // 5. 底部时间轴节点点击
    this.timelineNodesEl.forEach((node) => {
      node.addEventListener('click', () => {
        const year = parseInt(node.dataset.year, 10);
        this.goToEraByYear(year);
      });
    });

    // 6. 前后切换按钮
    const prevBtn = document.getElementById('btn-prev-era');
    const nextBtn = document.getElementById('btn-next-era');
    if (prevBtn) prevBtn.addEventListener('click', () => this.prevEra());
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextEra());

    // 7. 监听状态更新同步
    museumStore.subscribe((state) => {
      this.updateIndicators(state.currentEra);
      if (this.eggCountEl) {
        this.eggCountEl.textContent = `${state.eggs.length} / 6`;
      }
    });
  }

  snapToNearestEra() {
    const width = this.galleryEl.clientWidth;
    const scrollLeft = this.galleryEl.scrollLeft;
    const targetIdx = Math.round(scrollLeft / width);
    this.goToEraByIndex(targetIdx);
  }

  detectCurrentEraFromScroll() {
    const width = this.galleryEl.clientWidth || window.innerWidth;
    const scrollLeft = this.galleryEl.scrollLeft;
    const index = Math.round(scrollLeft / width);
    const clampedIndex = Math.max(0, Math.min(this.eras.length - 1, index));

    if (clampedIndex !== this.currentIndex) {
      this.currentIndex = clampedIndex;
      const targetEra = this.eras[clampedIndex];
      museumStore.update({ currentEra: targetEra.year });
      audioManager.playEraTransition();
    }
  }

  goToEraByIndex(index, smooth = true) {
    const clampedIndex = Math.max(0, Math.min(this.eras.length - 1, index));
    const width = this.galleryEl.clientWidth || window.innerWidth;
    const targetScroll = clampedIndex * width;

    this.isProgrammaticScroll = true;
    this.currentIndex = clampedIndex;
    const targetEra = this.eras[clampedIndex];

    museumStore.update({ currentEra: targetEra.year });
    audioManager.playEraTransition();

    this.galleryEl.scrollTo({
      left: targetScroll,
      behavior: smooth ? 'smooth' : 'auto'
    });

    setTimeout(() => {
      this.isProgrammaticScroll = false;
      this.updateIndicators(targetEra.year);
    }, smooth ? 450 : 50);
  }

  goToEraByYear(year) {
    const idx = this.eras.findIndex(e => e.year === year);
    if (idx !== -1) {
      this.goToEraByIndex(idx);
    }
  }

  nextEra() {
    if (this.currentIndex < this.eras.length - 1) {
      this.goToEraByIndex(this.currentIndex + 1);
    }
  }

  prevEra() {
    if (this.currentIndex > 0) {
      this.goToEraByIndex(this.currentIndex - 1);
    }
  }

  syncFromState() {
    const state = museumStore.getState();
    const idx = this.eras.findIndex(e => e.year === state.currentEra);
    const initialIndex = idx !== -1 ? idx : 0;
    this.goToEraByIndex(initialIndex, false);
    if (this.eggCountEl) {
      this.eggCountEl.textContent = `${state.eggs.length} / 6`;
    }
  }

  updateIndicators(year) {
    const config = this.eras.find(e => e.year === year) || this.eras[0];
    const index = this.eras.findIndex(e => e.year === year);

    if (this.eraIndicatorEl) {
      this.eraIndicatorEl.textContent = `${config.year} · ${config.name}`;
      this.eraIndicatorEl.style.borderColor = config.themeColor;
    }
    if (this.speedIndicatorEl) {
      this.speedIndicatorEl.textContent = config.speed;
    }
    if (this.statusIndicatorEl) {
      this.statusIndicatorEl.textContent = config.statusText;
    }

    // 更新时间轴高亮和进度线
    if (this.timelineNodesEl) {
      this.timelineNodesEl.forEach((node, i) => {
        const nodeYear = parseInt(node.dataset.year, 10);
        if (nodeYear === year) {
          node.classList.add('active');
        } else if (i < index) {
          node.classList.add('passed');
          node.classList.remove('active');
        } else {
          node.classList.remove('active', 'passed');
        }
      });
    }

    if (this.timelineProgressEl) {
      const percent = (index / (this.eras.length - 1)) * 100;
      this.timelineProgressEl.style.width = `${percent}%`;
    }
  }
}

export const navigationManager = new NavigationManager();
