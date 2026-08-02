import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import { useFriends } from '../hooks/useFriends';
import { ApiError, type Friend } from '../api';
import strings from '../strings.json';

export function FriendsView() {
  const { listFriends, searchFriend, addFriend, removeFriend } = useFriends();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [email, setEmail] = useState('');
  const [searchResult, setSearchResult] = useState<Friend | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    listFriends()
      .then(setFriends)
      .catch(() => setFriends([]));
  }, [listFriends]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || busy) return;
    setBusy(true);
    setError('');
    setSearchResult(null);
    try {
      const found = await searchFriend(email.trim());
      setSearchResult(found);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : strings.friends.notFound);
    } finally {
      setBusy(false);
    }
  };

  const handleAdd = async () => {
    if (!searchResult || busy) return;
    setBusy(true);
    setError('');
    try {
      const added = await addFriend(searchResult.email);
      setFriends((prev) => [...prev, added]);
      setSearchResult(null);
      setEmail('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : strings.auth.genericError);
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (id: number) => {
    await removeFriend(id);
    setFriends((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <Box sx={{ p: 2, maxWidth: 480, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        {strings.friends.title}
      </Typography>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
        <Stack component="form" onSubmit={handleSearch} direction="row" spacing={1}>
          <TextField
            size="small"
            fullWidth
            type="email"
            placeholder={strings.friends.searchPlaceholder}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setSearchResult(null);
            }}
          />
          <Button type="submit" variant="contained" disabled={busy}>
            {strings.friends.add}
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {searchResult && (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mt: 2, p: 1.5, borderRadius: 1, bgcolor: 'action.hover' }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <PersonIcon color="action" />
              <Box>
                <Typography fontWeight={600}>{searchResult.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchResult.email}
                </Typography>
              </Box>
            </Stack>
            <IconButton color="primary" onClick={handleAdd} disabled={busy} aria-label={strings.friends.add}>
              <PersonAddIcon />
            </IconButton>
          </Stack>
        )}
      </Paper>

      {friends.length === 0 ? (
        <Typography color="text.secondary">{strings.friends.empty}</Typography>
      ) : (
        <List disablePadding>
          {friends.map((friend) => (
            <ListItemButton
              key={friend.id}
              onClick={() => navigate(`/friends/${friend.id}`)}
              sx={{ borderRadius: 1, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary={friend.name} secondary={friend.email} />
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(friend.id);
                }}
                aria-label={strings.friends.remove}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </ListItemButton>
          ))}
        </List>
      )}
    </Box>
  );
}
