import React from 'react';
import { SafeAreaView, StyleSheet, View, Text, StatusBar, ActivityIndicator,Button } from 'react-native';
import { MailCase } from './src/components/MailCase';
import { useAPI } from './src/hook/useAPI';

export default function App() {
  const { mailEvents, loading, error,sendMailNotif } = useAPI();

  return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {loading && <ActivityIndicator size="large" color="#0000ff" />}
          {error && <Text style={styles.errorText}>Failed to load mail notifications</Text>}
          {!loading && !error && mailEvents.length > 0 && (
              mailEvents.map((event) => (
                  <MailCase key={event.id} event={{ eventId: event.id, eventTime: event.created_at, message: event.message }} handlePress={() => alert("test")} />
              ))
          )}
          <Button
              title="Send notifications"
              onPress={() => sendMailNotif(new Date())}
          />
          <StatusBar />
        </View>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e4e4e4',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    marginHorizontal: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 16,
  },
});