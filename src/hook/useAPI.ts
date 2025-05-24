import axios from 'axios';
import * as React from "react";

export function useAPI() {
    const [mailEvents, setMailEvents] = React.useState<{ id: number; created_at: string; image: string; message: string}[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<any>(null);

    const fetchMailNotif = async () => {
        try {
            console.log("Fetching mail notifications...");

            const response = await axios.get('http://192.168.245.217:5109/api/Mail/GetMails');
            // Vérifiez la structure de la réponse
            if (response.data && Array.isArray(response.data)) {
                // Séparez les données
                const fetchedMail = response.data.map((row: { eventId: number; eventTime: string | null; image: string; message: string }) => ({
                    id: row.eventId,
                    created_at: row.eventTime ? new Date(row.eventTime.replace(" ", "T") + "Z").toISOString() : "Date inconnue",
                    image: row.image,
                    message: row.message
                }));
                //console.log(fetchedMail);
                setMailEvents(fetchedMail);
            } else {
                throw new Error("Invalid response structure");
            }
        } catch (err) {
            setError(err);
            console.error("Error fetching mail notifications:", err);
        } finally {
            setLoading(false);
        }
    }

    const sendMailNotif = async (eventDate: Date) => {
        console.log("test")
        try {
                const response = await axios.post('http://192.168.245.217:5109/api/Mail/InsertMail', {
                    eventTime: eventDate.toISOString(),
                    image: null,
                    message: "Vous avez un nouveau courrier qui vous attend!"
                });
                console.log("Mail posté avec succès :", response.data);
            } catch (err) {
                console.error("Erreur lors de l'envoi du mail :", err);
            }

        }


    React.useEffect(() => {
        fetchMailNotif();
    }, []);

    return { mailEvents, loading, error,sendMailNotif };
}