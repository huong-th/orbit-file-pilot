import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Passkey {
  id: string;
  name: string;
  createdAt: string;
}

interface PasskeyState {
  passkeys: Passkey[];
}

const initialState: PasskeyState = {
  passkeys: [],
};

const passkeySlice = createSlice({
  name: 'passkey',
  initialState,
  reducers: {
    addPasskey: (state, action: PayloadAction<Passkey>) => {
      state.passkeys.push(action.payload);
    },
    removePasskey: (state, action: PayloadAction<string>) => {
      state.passkeys = state.passkeys.filter((passkey) => passkey.id !== action.payload);
    },
    setPasskeys: (state, action: PayloadAction<Passkey[]>) => {
      state.passkeys = action.payload;
    },
  },
});

export const { addPasskey, removePasskey, setPasskeys } = passkeySlice.actions;

export default passkeySlice.reducer;
