import React from 'react'
import sinon from 'sinon';
import { render, fireEvent } from '@testing-library/react';
import { initialState, Options, Help, Example } from '../Alphanumeric';
import * as langUtils from '~utils/langUtils';
const i18n = require('../i18n/en.json');

const defaultProps = {
	coreI18n: {},
	countryI18n: {},
	i18n,
	id: 'id',
	gridPanelDimensions: { width: 100, height: 100 }
};

describe('Example', () => {
	it('renders', () => {
		sinon.stub(langUtils, 'getStrings').returns({ core: {} });

		const data = { ...initialState };
		const onUpdate = jest.fn();
		const { container } = render(
			<Example
				{...defaultProps}
				data={data}
				onUpdate={onUpdate}
			/>
		);
		expect(container).toBeTruthy();
	});
});

describe('Options', () => {
	it('changing the content should call callback', () => {
		const data = { ...initialState };
		const onUpdate = jest.fn();
		const { container } = render(
			<Options
				{...defaultProps}
				data={data}
				onUpdate={onUpdate}
			/>
		);
		const field = container.querySelector('input');

		// @ts-ignore
		fireEvent.change(field, {
			target: {
				value: 'new value!!'
			}
		});

		expect(onUpdate).toBeCalledWith({
			...initialState,
			value: 'new value!!'
		});
	});
});

describe('Help', () => {
	it('renders', () => {
		const { container } = render(<Help {...defaultProps}/>);
		expect(container).toBeTruthy();
	});
});
