import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

export type MailCaseProps = {
    event:{
        eventId: number,
        eventTime: string,
        message: string
    }
    handlePress?: () => void,
}

export const MailCase = ({ handlePress, event}: MailCaseProps) => {
    return (
        <TouchableOpacity
            style={styles.container}
            activeOpacity={0.8}
            onPress={handlePress}
        >

            <View style={styles.textContainer}>
                <Text style={styles.text}>ID: {event.eventId}</Text>
                <Text style={styles.text}>Event Time: {event.eventTime}</Text>
                <Text style={styles.text}>Message: {event.message}</Text>
            </View>
            <Image
                style={styles.image}
                source={require('../assets/image-test.jpg')}
                resizeMode="contain"
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start', // Align items to the top
        marginVertical: 8,
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    textContainer: {
        flex: 1,
        flexDirection: 'column',
        marginLeft: 8,
    },
    text: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    image: {
        width: 120,
        height: 125,
        marginLeft: 8, // Adjust margin to ensure proper spacing
    },
});