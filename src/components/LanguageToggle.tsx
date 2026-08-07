import { ToggleButton, ToggleButtonGroup, Tooltip, type SxProps, type Theme } from '@mui/material';
import AbcIcon from '@mui/icons-material/Abc';
import TranslateIcon from '@mui/icons-material/Translate';
import type { PrimaryField } from '../types';
import { useStrings } from '../i18n/I18nContext';

interface LanguageToggleProps {
  value: PrimaryField;
  onChange: (value: PrimaryField) => void;
  sx?: SxProps<Theme>;
}

export function LanguageToggle({ value, onChange, sx }: LanguageToggleProps) {
  const strings = useStrings();
  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={value}
      onChange={(_, next: PrimaryField | null) => next && onChange(next)}
      aria-label={strings.header.learning}
      sx={sx}
    >
      <ToggleButton value="word" aria-label={strings.header.word}>
        <Tooltip title={strings.header.word}>
          <AbcIcon fontSize="small" />
        </Tooltip>
      </ToggleButton>
      <ToggleButton value="translation" aria-label={strings.header.translation}>
        <Tooltip title={strings.header.translation}>
          <TranslateIcon fontSize="small" />
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
