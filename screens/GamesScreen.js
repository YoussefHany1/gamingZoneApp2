import { ScrollView, StyleSheet, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { EpicFreeGames } from 'epic-free-games';
import FreeGames from "../components/FreeGames";
import GamesList from "../components/GamesList";
import Loading from '../Loading'

function GamesScreen() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const epicFreeGames = new EpicFreeGames({
            country: "US",
            locale: "en-US",
            includeAll: true,
        });

        epicFreeGames
            .getGames()
            .then((res) => {
                setData(res);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching games:", err);
                setLoading(false);
            });
    }, []);
    // console.log(data)
    return (
        <>
            <SafeAreaView style={styles.container}>
                <ScrollView >

                    {loading ? (
                        <Loading />
                    ) : (
                        <View style={{ marginBottom: 60 }}>
                            <Text style={styles.header}>Find Your Next Gaming Adventure</Text>
                            <FreeGames data={data} />
                            <GamesList endpoint="/popular" />
                            <GamesList endpoint="/recently-released" />
                            <GamesList endpoint="/top-rated" />
                            <GamesList endpoint="/coming-soon" />
                            <GamesList endpoint="/most-anticipated" />
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </>
    );
}
export default GamesScreen;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0c1a33"
    },
    header: {
        color: "white",
        fontSize: 28,
        textAlign: "center",
        alignSelf: "center",
        fontWeight: "bold",
        backgroundColor: "#516996",
        paddingHorizontal: 15,
        paddingVertical: 8,
        margin: 30,
        marginTop: 10,
        borderRadius: 16
    },
});