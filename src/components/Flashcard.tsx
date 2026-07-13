import { Box, Typography } from '@mui/material';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import strings from '../strings.json';

interface FlashcardProps {
  word: string;
  transcription: string;
  translation: string;
  flipped: boolean;
  onFlip: () => void;
}

export function Flashcard({ word, transcription, translation, flipped, onFlip }: FlashcardProps) {
  return (
    <Box
      onClick={onFlip}
      sx={{
        width: '100%',
        maxWidth: 380,
        height: 240,
        mx: 'auto',
        perspective: 1200,
        cursor: 'pointer',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transition: 'transform 0.5s',
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            borderRadius: 3,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            boxShadow: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" fontWeight={700}>
            {word}
          </Typography>
          {transcription && (
            <Typography variant="subtitle1" sx={{ opacity: 0.85, mt: 1 }}>
              [{transcription}]
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 3, opacity: 0.75 }}>
            <TouchAppIcon fontSize="small" />
            <Typography variant="caption">{strings.flashcard.hint}</Typography>
          </Box>
        </Box>

        {/* Back */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            borderRadius: 3,
            bgcolor: 'secondary.main',
            color: 'secondary.contrastText',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            boxShadow: 3,
            transform: 'rotateY(180deg)',
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" fontWeight={700}>
            {translation}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
