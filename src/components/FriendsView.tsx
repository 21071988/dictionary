import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Autocomplete,
  Box,
  CircularProgress,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import { useFriends } from '../hooks/useFriends';
import { useDebounce } from '../hooks/useDebounce';
import { ApiError, type Friend, type FriendRequest } from '../api';
import { useStrings } from '../i18n/I18nContext';

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 300;

export function FriendsView() {
  const strings = useStrings();
  const {
    listFriends,
    searchFriends,
    sendFriendRequest,
    listIncomingRequests,
    listOutgoingRequests,
    approveRequest,
    rejectRequest,
    cancelRequest,
    removeFriend,
  } = useFriends();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRequest[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(inputValue.trim(), DEBOUNCE_MS);

  useEffect(() => {
    listFriends()
      .then(setFriends)
      .catch(() => setFriends([]));
    listIncomingRequests()
      .then(setIncoming)
      .catch(() => setIncoming([]));
    listOutgoingRequests()
      .then(setOutgoing)
      .catch(() => setOutgoing([]));
  }, [listFriends, listIncomingRequests, listOutgoingRequests]);

  useEffect(() => {
    if (debouncedQuery.length < MIN_QUERY_LENGTH) {
      setOptions([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    searchFriends(debouncedQuery)
      .then((found) => {
        if (!cancelled) setOptions(found);
      })
      .catch(() => {
        if (!cancelled) setOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, searchFriends]);

  const handleSendRequest = async (friend: Friend | null) => {
    if (!friend || busy) return;
    setBusy(true);
    setError('');
    try {
      const request = await sendFriendRequest(friend.email);
      setOutgoing((prev) => [request, ...prev]);
      setInputValue('');
      setOptions([]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : strings.auth.genericError);
    } finally {
      setBusy(false);
    }
  };

  const handleApprove = async (request: FriendRequest) => {
    setError('');
    try {
      await approveRequest(request.id);
      setIncoming((prev) => prev.filter((r) => r.id !== request.id));
      setFriends((prev) => [...prev, request.user]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : strings.auth.genericError);
    }
  };

  const handleReject = async (request: FriendRequest) => {
    setError('');
    try {
      await rejectRequest(request.id);
      setIncoming((prev) => prev.filter((r) => r.id !== request.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : strings.auth.genericError);
    }
  };

  const handleCancel = async (request: FriendRequest) => {
    setError('');
    try {
      await cancelRequest(request.id);
      setOutgoing((prev) => prev.filter((r) => r.id !== request.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : strings.auth.genericError);
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
        <Autocomplete
          value={null}
          inputValue={inputValue}
          onInputChange={(_, value) => setInputValue(value)}
          onChange={(_, value) => handleSendRequest(value)}
          open={debouncedQuery.length >= MIN_QUERY_LENGTH}
          options={options}
          loading={loading}
          filterOptions={(x) => x}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          noOptionsText={strings.friends.notFound}
          disabled={busy}
          renderOption={({ key, ...props }, option) => (
            <ListItemButton key={option.id} component="li" {...props}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={option.name} secondary={option.email} />
            </ListItemButton>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              fullWidth
              placeholder={strings.friends.searchPlaceholder}
              slotProps={{
                input: {
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={16} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                },
              }}
            />
          )}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      {incoming.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="overline" color="text.secondary">
            {strings.friends.waitingApproval}
          </Typography>
          <List disablePadding>
            {incoming.map((request) => (
              <ListItemButton key={request.id} sx={{ borderRadius: 1, mb: 0.5 }} disableRipple>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary={request.user.name} secondary={request.user.email} />
                <IconButton
                  color="primary"
                  onClick={() => handleApprove(request)}
                  aria-label={strings.friends.approve}
                >
                  <CheckIcon />
                </IconButton>
                <IconButton onClick={() => handleReject(request)} aria-label={strings.friends.reject}>
                  <CloseIcon />
                </IconButton>
              </ListItemButton>
            ))}
          </List>
        </Box>
      )}

      {outgoing.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="overline" color="text.secondary">
            {strings.friends.sentRequests}
          </Typography>
          <List disablePadding>
            {outgoing.map((request) => (
              <ListItemButton key={request.id} sx={{ borderRadius: 1, mb: 0.5 }} disableRipple>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary={request.user.name} secondary={request.user.email} />
                <IconButton
                  size="small"
                  onClick={() => handleCancel(request)}
                  aria-label={strings.friends.cancelRequest}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </ListItemButton>
            ))}
          </List>
        </Box>
      )}

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
