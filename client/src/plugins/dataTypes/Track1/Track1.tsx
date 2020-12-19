import * as React from 'react';
import { DTHelpProps } from '~types/dataTypes';

export const Help = ({ i18n }: DTHelpProps): JSX.Element => <p>{i18n.track1_help_intro}</p>;
