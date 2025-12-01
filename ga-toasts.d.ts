export type GaToastType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'primary'
  | 'secondary';

export type GaToastPosition =
  | 'top-start'
  | 'top-center'
  | 'top-end'
  | 'middle-start'
  | 'middle-center'
  | 'middle-end'
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end';

export type GaToastAnimation = 'fade' | 'slide' | 'bounce' | 'scale';

export type GaToastVariant = '' | 'filled' | 'light';

export type GaToastProgressPosition = 'top' | 'bottom' | 'none';

export type GaToastSize = '' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface GaToastAction {
  text: string;
  class?: string;
  click?: (event: Event, toast: HTMLElement | string) => void;
}

export interface GaToastOptions {
  id?: string;
  title?: string;
  message?: string;
  type?: GaToastType;
  duration?: number;
  closable?: boolean;
  position?: GaToastPosition;
  icon?: string;
  actions?: GaToastAction[];
  size?: GaToastSize;
  variant?: GaToastVariant;
  animation?: GaToastAnimation;
  clickToClose?: boolean;
  progress?: boolean;
  progressBackground?: boolean;
  pauseOnHover?: boolean;
  glassmorphism?: boolean;
  /** Denser layout with reduced padding */
  compact?: boolean;
  /** Show a small status chip (defaults to capitalized type) */
  showStatus?: boolean;
  statusText?: string;
  /** Automatically choose an icon based on type (default: true) */
  autoIcon?: boolean;
  /** Pin toast (no auto close, visually indicated) */
  pinned?: boolean;
  /** Where to render progress bar */
  progressPosition?: GaToastProgressPosition;
  /** Segmented progress: total steps in a multi-step flow */
  steps?: number;
  /** Segmented progress: current step (1-based) */
  currentStep?: number;
}

export interface GaToastsApi {
  show(options: GaToastOptions): HTMLElement;
  success(message: string, options?: GaToastOptions): HTMLElement;
  error(message: string, options?: GaToastOptions): HTMLElement;
  warning(message: string, options?: GaToastOptions): HTMLElement;
  info(message: string, options?: GaToastOptions): HTMLElement;
  confirm(message: string, options?: GaToastOptions & {
    onConfirm?: () => void;
    onCancel?: () => void;
  }): HTMLElement;
  loading(message?: string, options?: GaToastOptions): HTMLElement;

  close(toast: HTMLElement | string): void;
  closeAll(): void;
  clear(type?: GaToastType): void;
  update(toastId: string, options: Partial<GaToastOptions>): boolean;
  getCount(type?: GaToastType): number;
  exists(toastId: string): boolean;
  get(toastId: string): HTMLElement | null;

  setDefaults(defaults: GaToastOptions): void;
  setLogger(
    logger: ((event: string, payload: unknown) => void) | null
  ): void;
}

declare const GaToasts: GaToastsApi;

export default GaToasts;


