import { ScrollView, Text, StyleSheet } from "react-native";
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
            <ScrollView style={styles.container}>

                {loading ? (
                    <Loading />
                ) : (
                    <FreeGames data={data} />
                )}
                <GamesList endpoint="/popular" />
                <GamesList endpoint="/recently-released" />
                <GamesList endpoint="/top-rated" />
                <GamesList endpoint="/coming-soon" />
                <GamesList endpoint="/most-anticipated" />
            </ScrollView>
        </>
    );
}
export default GamesScreen;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0c1a33",
        paddingTop: 70,
    },
    header: {
        color: "white",
        fontSize: 24,
        marginRight: 50,
        fontWeight: 500,
        marginLeft: 10,
        marginBottom: 10
    }
});