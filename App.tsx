import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  StatusBar,
  ActivityIndicator,
  Button,
  PermissionsAndroid, Platform, Animated
} from 'react-native';
import { MailCase } from './src/components/MailCase';
import { useAPI } from './src/hook/useAPI';
import BluetoothSerial,{BluetoothDevice, BluetoothEventSubscription} from "react-native-bluetooth-classic";
import ScrollView = Animated.ScrollView;

export default function App() {
  const { mailEvents, loading, error,sendMailNotif } = useAPI();
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [messages, setMessages] = useState('');
  const [messageCount, setMessageCount] = useState(0);

  const [subscription, setSubscription] = useState<BluetoothEventSubscription | null>(null);

  useEffect(() => {
    requestPermissions().then(fetchPairedDevices);
    return () => {
      subscription?.remove(); // Ensure the subscription has a remove method
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (connectedDevice) {
        try {
          const isConnected = await connectedDevice.isConnected();
          if (!isConnected) {
            console.warn("Device is not connected.");
            setConnectedDevice(null); // Reset the connected device state
            clearInterval(interval); // Stop the interval if the device is disconnected
            return;
          }

          const available = await connectedDevice.available();
          if (available > 0) {
            const data = await connectedDevice.read();
            console.log("Received data:", data);
            setMessages(data.toString());
            setMessageCount((prev) => prev + 1);
          }
        } catch (error) {
          console.error("Error while reading data:", error);
        }
      }
    }, 1000); // Refresh every 1 second

    return () => clearInterval(interval); // Cleanup on unmount
  }, [connectedDevice]);


  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
    }
  };

  const fetchPairedDevices = async () => {
    try {
      const bonded = await BluetoothSerial.getBondedDevices();
      setDevices(bonded);
    } catch (err) {
      console.error('Erreur lors de la récupération des appareils :', err);
    }
  };

  const connectToDevice = async (device: BluetoothDevice, retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) { // Retry up to 3 times
      try {
        console.log(`Attempt ${attempt} to connect to device: ${device.name}`);
        const connected = await device.connect(); // Attempt to connect to the device
        if (connected) { // Connection successful
          console.log('Connected to device:', device.name);
          setConnectedDevice(device);

          // Add a delay to ensure the connection is stable
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Check if the device is still connected
          if (await device.isConnected()) {
            console.log('Device is ready for communication.');
            // Send a message to the Arduino
            await device.write("Message to Arduino : Connected");
          } else {
            console.error('Device disconnected unexpectedly.');
          }

          return; // Exit the loop on successful connection
        }
      } catch (error) {
        console.error(`Connection attempt ${attempt} failed:`, error);
        if (attempt === retries) {
          alert('Failed to connect to the device after multiple attempts.');
        }
      }
    }
  };
  useEffect(() => {
    if (messageCount > 0) {
      console.log("Nouveau message reçu, envoi de notification");
      sendMailNotif(new Date());
    }
  }, [messageCount]);

  // const sendMessage = async () => {
  //   if (connectedDevice) {
  //     try {
  //       await connectedDevice.write(message + '\n');
  //       alert('Message sent: ' + message);
  //       setMessage(''); // Clear the input after sending
  //     } catch (error) {
  //       console.error('Failed to send message:', error);
  //       alert('Failed to send the message.');
  //     }
  //   } else {
  //     alert('No device connected.');
  //   }
  // };

  return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView>
          <View style={styles.container}>
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
            {error && <Text style={styles.errorText}>Failed to load mail notifications</Text>}
            {!loading && !error && mailEvents.length > 0 && (
                mailEvents.map((event) => (
                    <MailCase key={event.id} event={{ eventId: event.id, eventTime: event.created_at, message: event.message }} handlePress={() => alert("test")} />
                ))
            )}
            {devices
                .filter((device) => device.name === "HC-05") // Filtrer uniquement les appareils HC-05
                .map((device) => (
                    <View key={device.address} style={styles.deviceButton}>
                      <Button title={device.name ?? device.address} onPress={() => connectToDevice(device)} />
                    </View>
                ))}
            <Button
                title="Send notifications"
                onPress={() => sendMailNotif(new Date())}
            />
            <StatusBar />
          </View>
        </ScrollView>
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
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 10,
  },
  deviceButton: {
    marginVertical: 5,
  },
  messagesContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
});