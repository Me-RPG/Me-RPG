import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { router } from "expo-router";
import { syncLine, useAccount } from "../sync/account";
import { Body, Button, Card, Divider, Label, Row, Screen, Title } from "../ui/components";
import { color, font, radius } from "../ui/theme";

/** Sign-in (email one-time code), sync status, heroes on the account, data export and account deletion. */
export default function Account() {
  const session = useAccount((s) => s.session);
  const status = useAccount((s) => s.status);
  const message = useAccount((s) => s.message);
  const clearMessage = useAccount((s) => s.clearMessage);

  return (
    <Screen>
      {message ? (
        <Card tone="deep">
          <Body>{message}</Body>
          <Button small kind="secondary" title="Dismiss" onPress={clearMessage} />
        </Card>
      ) : null}
      {status === "unconfigured" ? (
        <Card>
          <Title size={18}>Accounts are off</Title>
          <Body muted>{syncLine(status, 0)} Add the Supabase settings to apps/mobile/.env.local (see .env.example) to turn them on.</Body>
        </Card>
      ) : session ? <SignedIn /> : <SignIn />}
    </Screen>
  );
}

function SignIn() {
  const busy = useAccount((s) => s.busy);
  const sendCode = useAccount((s) => s.sendCode);
  const verifyCode = useAccount((s) => s.verifyCode);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const emailOk = /^\S+@\S+\.\S+$/.test(email.trim());

  if (sentTo === null) {
    return (
      <Card>
        <Title size={18}>Keep your hero safe</Title>
        <Body muted>Sign in to back up your journey and continue it on another device. We'll email you a one-time code, so there's no password to remember.</Body>
        <Label>Email</Label>
        <TextInput
          testID="email" value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={color.inkMuted}
          keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress"
          style={styles.input}
        />
        <Button testID="send-code" title={busy ? "Sending…" : "Email me a code"} disabled={busy || !emailOk} onPress={async () => { if (await sendCode(email)) setSentTo(email.trim()); }} />
      </Card>
    );
  }
  return (
    <Card>
      <Title size={18}>Check your email</Title>
      <Body muted>Enter the code we sent to {sentTo}.</Body>
      <TextInput
        testID="code" value={code} onChangeText={(t) => setCode(t.replace(/\D/g, ""))} placeholder="123456" placeholderTextColor={color.inkMuted}
        keyboardType="number-pad" autoComplete="one-time-code" textContentType="oneTimeCode" maxLength={10}
        style={[styles.input, styles.code]}
      />
      <Button testID="verify-code" title={busy ? "Checking…" : "Sign in"} disabled={busy || code.length < 6} onPress={() => void verifyCode(sentTo, code)} />
      <Row>
        <View style={{ flex: 1 }}><Button small kind="secondary" title="Send a new code" disabled={busy} onPress={() => void sendCode(sentTo)} /></View>
        <View style={{ flex: 1 }}><Button small kind="secondary" title="Different email" onPress={() => { setSentTo(null); setCode(""); }} /></View>
      </Row>
    </Card>
  );
}

function SignedIn() {
  const session = useAccount((s) => s.session)!;
  const status = useAccount((s) => s.status);
  const unsynced = useAccount((s) => s.unsynced);
  const heroes = useAccount((s) => s.heroes);
  const currentId = useAccount((s) => s.meta.characterId);
  const busy = useAccount((s) => s.busy);
  const { syncNow, signOut, playHero, exportData, deleteAccount } = useAccount.getState();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <Card>
        <Label>Signed in as</Label>
        <Body>{session.user.email}</Body>
        <Body muted>{syncLine(status, unsynced)}</Body>
        <Row>
          <View style={{ flex: 1 }}><Button small testID="sync-now" title={status === "syncing" ? "Saving…" : "Sync now"} disabled={status === "syncing"} onPress={() => void syncNow()} /></View>
          <View style={{ flex: 1 }}><Button small kind="secondary" testID="sign-out" title="Sign out" disabled={busy} onPress={() => void signOut()} /></View>
        </Row>
      </Card>

      <Card>
        <Title size={18}>Heroes on your account</Title>
        {heroes.length === 0 ? <Body muted>None yet. Your hero is saved here as soon as you play while signed in.</Body> : null}
        {heroes.map((h, i) => (
          <View key={h.id} style={{ gap: 4 }}>
            {i > 0 ? <Divider /> : null}
            <Body>{h.name ?? "Unnamed hero"}</Body>
            <Body muted>{h.headSeq} entries · last saved {new Date(h.updatedAt).toLocaleDateString()}</Body>
            {h.id === currentId
              ? <Label>On this device</Label>
              : <Button small kind="secondary" title="Play this hero" disabled={busy} onPress={async () => { if (await playHero(h.id)) router.replace("/quests"); }} />}
          </View>
        ))}
      </Card>

      <Card>
        <Title size={18}>Your data</Title>
        <Body muted>Download a copy of everything stored for your account.</Body>
        <Button small kind="secondary" testID="export" title="Export my data" disabled={busy} onPress={() => void exportData()} />
        <Divider />
        <Body muted>Delete your account and everything stored with it on our servers. This can't be undone.</Body>
        {confirmDelete ? (
          <Row>
            <View style={{ flex: 1 }}><Button small kind="danger" testID="confirm-delete" title="Delete forever" disabled={busy} onPress={async () => { if (await deleteAccount()) setConfirmDelete(false); }} /></View>
            <View style={{ flex: 1 }}><Button small kind="secondary" title="Keep my account" onPress={() => setConfirmDelete(false)} /></View>
          </Row>
        ) : (
          <Button small kind="secondary" testID="delete-account" title="Delete account…" onPress={() => setConfirmDelete(true)} />
        )}
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  input: { fontFamily: font.body, fontSize: 18, color: color.ink, borderWidth: 1, borderColor: color.line, borderRadius: radius.sm, padding: 10, backgroundColor: color.parchment },
  code: { fontFamily: font.bodyBold, fontSize: 24, letterSpacing: 6, textAlign: "center" },
});
