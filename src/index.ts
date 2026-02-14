import { createCssVarBinding, createStyleBinding } from './bindings';
import { analyzeContrast, getContrastRatio } from './contrast';
import { createBerryPickrController, BERRY_PICKR_CONTEXTS } from './controller';
import { createBerryPickrControllerManager } from './controllerManager';
import { mountBerryPickrUI } from './mountBerryPickrUI';

/**
 * Current BerryPickr package version.
 */
export const version = __BERRYPICKR_VERSION__;

export { BERRY_PICKR_CONTEXTS };

export { createBerryPickrController, createBerryPickrControllerManager, mountBerryPickrUI };
export { createCssVarBinding, createStyleBinding };
export { analyzeContrast, getContrastRatio };

export type {
  BerryPickrBinding,
  BerryPickrBindingTarget,
  BerryPickrChangeEvent,
  BerryPickrCommitEvent,
  BerryPickrCommitOptions,
  ChangeSource,
  BerryPickrColor,
  BerryPickrComponents,
  BerryPickrContext,
  BerryPickrController,
  BerryPickrControllerEvents,
  BerryPickrControllerManager,
  BerryPickrControllerOptions,
  BerryPickrContrastResult,
  BerryPickrCssVarBindingConfig,
  BerryPickrFormat,
  BerryPickrHistoryChangeEvent,
  BerryPickrHistoryOptions,
  BerryPickrHistorySnapshot,
  BerryPickrI18n,
  BerryPickrPluginErrorEvent,
  BerryPickrPluginErrorPhase,
  BerryPickrPluginErrorPolicy,
  BerryPickrOpenChangeEvent,
  BerryPickrMode,
  BerryPickrOptionsChangeEvent,
  BerryPickrPlugin,
  BerryPickrPluginContext,
  BerryPickrPresets,
  BerryPickrRecentColorStorage,
  BerryPickrRecentColorsOptions,
  BerryPickrSetValueOptions,
  BerryPickrStateSnapshot,
  BerryPickrStyleBindingConfig,
  BerryPickrUIFocusPart,
  BerryPickrUIOptions,
  BerryPickrUIMount,
  ResolvedBerryPickrUIOptions
} from './types';
