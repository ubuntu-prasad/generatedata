import { GDAction, GDLocale } from '../../../types/general';
import * as selectors from './generator.selectors';
import { generatePreviewData } from './generator';
import { ExportSettingsTab } from '../exportSettings/ExportSettings.types';
import { DataTypeFolder, ExportTypeFolder } from '../../_plugins';
import { requestDataTypeBundle } from '../../utils/dataTypeUtils';
import { registerInterceptors } from '../actionInterceptor';
import { loadExportTypeBundle } from '../../utils/exportTypeUtils';
import { DTBundle } from '../../../types/dataTypes';
import { ThunkDispatch } from 'redux-thunk';
import * as langUtils from '../../utils/langUtils';
import C from '../../core/constants';
import { Dispatch } from 'redux';

export const ADD_ROWS = 'ADD_ROWS';
export const addRows = (numRows: number): GDAction => ({
	type: ADD_ROWS,
	payload: {
		numRows
	}
});

export const REMOVE_ROW = 'REMOVE_ROW';
export const removeRow = (id: string): GDAction => ({ type: REMOVE_ROW, payload: { id } });

export const CHANGE_TITLE = 'CHANGE_TITLE';
export const onChangeTitle = (id: string, value: string): GDAction => ({
	type: CHANGE_TITLE,
	payload: {
		id, value
	}
});

export const SELECT_DATA_TYPE = 'SELECT_DATA_TYPE';
export const onSelectDataType = (dataType: DataTypeFolder, gridRowId?: string): any => {
	return (dispatch: any): any => loadDataTypeBundle(dispatch, dataType, gridRowId);
};

export const loadDataTypeBundle = (dispatch: Dispatch, dataType: DataTypeFolder, gridRowId?: string): void => {
	requestDataTypeBundle(dataType)
		.then((bundle: DTBundle) => {
			dispatch(dataTypeLoaded(dataType));
			if (bundle.actionInterceptors) {
				registerInterceptors(dataType, bundle.actionInterceptors);
			}

			// if it's been selected within the grid, select the row and update the preview panel
			if (gridRowId) {
				dispatch({
					type: SELECT_DATA_TYPE,
					payload: {
						id: gridRowId,
						value: dataType,
						data: bundle.initialState
					}
				});
				dispatch(refreshPreview([gridRowId]));
			}
		});
};

export const CONFIGURE_DATA_TYPE = 'CONFIGURE_DATA_TYPE';
export const onConfigureDataType = (id: string, data: any, triggeredByInterceptor = false): any => {
	return (dispatch: any): any => {
		const configureDataType = (disp: any): any => new Promise((resolve: any) => {
			disp({
				type: CONFIGURE_DATA_TYPE,
				triggeredByInterceptor,
				payload: {
					id, data
				}
			});
			resolve();
		});
		configureDataType(dispatch).then(() => dispatch(refreshPreview([id])));
	};
};

export const CONFIGURE_EXPORT_TYPE = 'CONFIGURE_EXPORT_TYPE';
export const configureExportType = (data: any): GDAction => ({
	type: CONFIGURE_EXPORT_TYPE,
	payload: {
		data
	}
});

export const REPOSITION_ROW = 'REPOSITION_ROW';
export const repositionRow = (id: string, newIndex: number): GDAction => ({
	type: REPOSITION_ROW,
	payload: {
		id, newIndex
	}
});

export const TOGGLE_GRID = 'TOGGLE_GRID';
export const toggleGrid = (): GDAction => ({ type: TOGGLE_GRID });

export const TOGGLE_PREVIEW = 'TOGGLE_PREVIEW';
export const togglePreview = (): GDAction => ({ type: TOGGLE_PREVIEW });

export const REFRESH_PREVIEW_DATA = 'REFRESH_PREVIEW_DATA';

// make this the ONLY place that re-generates the preview panel data. This doesn't have to be called on boot-up because
// the preview data is generated on the fly, saved in the store and rehydrated when the app loads
export const refreshPreview = (idsToRefresh: string[] = []): any => {
	return (dispatch: any, getState: any): any => {
		const state = getState();
		const template = selectors.getGenerationTemplate(state);
		const sortedRows = selectors.getSortedRows(state);

		// TODO publish event here so a loading spinner should appear

		generatePreviewData({
			numResults: C.MAX_PREVIEW_ROWS,
			columns: selectors.getColumns(state),
			template
		}).then((data: any) => {
			const previewData: any = {};
			sortedRows.forEach((id: string, index: number) => {
				if (idsToRefresh.length && idsToRefresh.indexOf(id) === -1) {
					return;
				}
				previewData[id] = data.map((row: any): any => row[index]);
			});

			dispatch({
				type: REFRESH_PREVIEW_DATA,
				payload: {
					previewData
				}
			});
		});
	};
};

export const TOGGLE_LAYOUT = 'TOGGLE_LAYOUT';
export const toggleLayout = (): GDAction => ({ type: TOGGLE_LAYOUT });

export const UPDATE_NUM_PREVIEW_ROWS = 'UPDATE_NUM_PREVIEW_ROWS';
export const updateNumPreviewRows = (numRows: number): GDAction => ({ type: UPDATE_NUM_PREVIEW_ROWS, payload: { numRows } });

export const CHANGE_THEME = 'CHANGE_THEME';
export const changeTheme = (theme: string): GDAction => ({ type: CHANGE_THEME, payload: { theme } });

export const TOGGLE_SHOW_ROW_NUMBERS = 'TOGGLE_SHOW_ROW_NUMBERS';
export const toggleShowRowNumbers = (): GDAction => ({ type: TOGGLE_SHOW_ROW_NUMBERS });

export const TOGGLE_LINE_WRAPPING = 'TOGGLE_LINE_WRAPPING';
export const toggleLineWrapping = (): GDAction => ({ type: TOGGLE_LINE_WRAPPING });

export const SET_PREVIEW_TEXT_SIZE = 'SET_PREVIEW_TEXT_SIZE';
export const setPreviewTextSize = (previewTextSize: number): GDAction => ({
	type: SET_PREVIEW_TEXT_SIZE,
	payload: {
		previewTextSize
	}
});

export const TOGGLE_EXPORT_SETTINGS = 'TOGGLE_EXPORT_SETTINGS';
export const toggleExportSettings = (tab?: ExportSettingsTab): GDAction => ({
	type: TOGGLE_EXPORT_SETTINGS,
	payload: {
		tab
	}
});

export const SELECT_EXPORT_TYPE = 'SELECT_EXPORT_TYPE';
export const onSelectExportType = (exportType: ExportTypeFolder): any => {
	return (dispatch: any): any => {
		dispatch({
			type: SELECT_EXPORT_TYPE,
			payload: {
				exportType
			}
		});

		loadExportTypeBundle(exportType)
			.then((bundle: DTBundle) => {
				dispatch(exportTypeLoaded(exportType, bundle.initialState));
			});
	};
};


export const LOCALE_FILE_LOADED = 'LOCALE_FILE_LOADED';
export const setLocaleFileLoaded = (locale: GDLocale): GDAction => ({
	type: LOCALE_FILE_LOADED,
	payload: {
		locale
	}
});

export const selectLocale = (locale: GDLocale) => {
	return (dispatch: ThunkDispatch<any, any, any>): any => {
		window.gd = {};
		window.gd.localeLoaded = (strings: any): void => {
			langUtils.setLocale(locale, strings);
			dispatch(setLocaleFileLoaded(locale));
		};
		const s = document.createElement('script');
		s.src = `./${locale}.js`;
		document.body.appendChild(s);
	};
};

export const EXPORT_TYPE_LOADED = 'EXPORT_TYPE_LOADED';
export const exportTypeLoaded = (exportType: ExportTypeFolder, initialState: any): GDAction => ({
	type: EXPORT_TYPE_LOADED,
	payload: {
		exportType,
		initialState
	}
});

export const DATA_TYPE_LOADED = 'DATA_TYPE_LOADED';
export const dataTypeLoaded = (dataType: DataTypeFolder): GDAction => ({
	type: DATA_TYPE_LOADED,
	payload: {
		dataType
	}
});

export const SHOW_GENERATION_PANEL = 'SHOW_GENERATION_PANEL';
export const showGenerationPanel = (): GDAction => ({ type: SHOW_GENERATION_PANEL });

export const HIDE_GENERATION_PANEL = 'HIDE_GENERATION_PANEL';
export const hideGenerationPanel = (): GDAction => ({ type: HIDE_GENERATION_PANEL });

export const UPDATE_NUM_GENERATION_ROWS = 'UPDATE_NUM_GENERATION_ROWS';
export const updateNumGenerationRows = (numGenerationRows: number): GDAction => ({
	type: UPDATE_NUM_GENERATION_ROWS,
	payload: {
		numGenerationRows
	}
});

export const TOGGLE_STRIP_WHITESPACE = 'TOGGLE_STRIP_WHITESPACE';
export const toggleStripWhitespace = (): GDAction => ({ type: TOGGLE_STRIP_WHITESPACE });

export const GENERATE_DATA = 'GENERATE_DATA';
export const generateData = (): GDAction => ({ type: GENERATE_DATA });
