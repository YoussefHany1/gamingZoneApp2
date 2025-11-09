// screens/NewsDetailsScreen.js
import {
    View,
    Text,
    StyleSheet,
    Image,
    ImageBackground,
    ScrollView,
    Pressable,
    Linking,
    Modal,
    TouchableOpacity
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import YoutubePlayer from 'react-native-youtube-iframe';
import Swiper from "react-native-swiper";

function GameDetails({ game, visible, onClose }) {
    function getRatingColor(rating) {
        if (rating <= 2) return '#8B0000';
        if (rating <= 4) return '#FF4C4C';
        if (rating <= 6) return '#FFA500';
        if (rating <= 8) return '#71e047';
        return '#006400';
    }
    const storeIcons = {
        13: require("../assets/steam.png"),
        16: require("../assets/epic-games.png"),
        17: require("../assets/gog.png"),
        23: require("../assets/playstation.png"),
        22: require("../assets/xbox.png"),
        24: require("../assets/nintendo-switch.png"),
        12: require("../assets/play-store.png"),
        10: require("../assets/apple-store.png"),
    };
    console.log(game)
    return (
        <Modal
            animationType="slide"
            backdropColor="#0c1a33"
            visible={visible}
            onRequestClose={onClose}
            style={styles.modalContainer}>
            {/*close button on top*/}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                >
                    <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
            >
                <Image
                    style={styles.image}
                    source={
                        game.cover.image_id
                            ? { uri: `https://images.igdb.com/igdb/image/upload/t_720p/${game.cover.image_id}.jpg` }
                            : require("../assets/image-not-found.webp")
                    }
                />
                <View style={styles.backgroundContainer}>
                    <LinearGradient
                        colors={["transparent", "#0c1a33"]}
                        style={[styles.gradient, styles.leftGradient]}
                        start={{ x: 1, y: 0.5 }}
                        end={{ x: 0, y: 0.5 }}
                    />
                    <LinearGradient
                        colors={["#0c1a33", "transparent"]}
                        style={[styles.gradient, styles.rightGradient]}
                        start={{ x: 1, y: 0.5 }}
                        end={{ x: 0, y: 0.5 }}
                    />
                </View>
                <View style={styles.content}>
                    <Text style={styles.title}>{game.name}</Text>
                    <Text style={styles.releaseDate}>{game.release_dates?.[0]?.human}</Text>
                    <View style={styles.contentHeader}>
                        <View style={styles.platformContainer}>
                            {game.platforms.map((platform) => (
                                <Text key={platform.id} style={styles.platform}>{platform.abbreviation}</Text>
                            ))}
                        </View>
                        {game.total_rating ?
                            <Text style={[
                                styles.rating,
                                { backgroundColor: getRatingColor(game.total_rating / 10) }
                            ]}>{Math.round(game.total_rating) / 10}</Text> :
                            <Text style={[
                                styles.rating,
                                { backgroundColor: "#516996" }
                            ]}>N/A</Text>}
                    </View>
                    {game.websites && <Text style={styles.storesHeader}>Available at these stores</Text>}
                    <View style={styles.storesContainer}>
                        {game.websites?.map((site) => {
                            const icon = storeIcons[site.type];
                            if (!icon) return null;

                            return (
                                <TouchableOpacity
                                    key={site.id}
                                    style={styles.storesBtn}
                                    onPress={() => Linking.openURL(site.url)}
                                >
                                    <Image
                                        style={styles.storeImg}
                                        resizeMode="contain"
                                        source={icon}
                                    />
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    <View style={styles.playContainer}>
                        <TouchableOpacity
                            style={styles.wantBtn}>
                            <Text style={styles.wantBtnText}><Ionicons name="bookmark" size={20} color="white" /> Want</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.playedBtn}>
                            <Text style={styles.playedBtnText}><Ionicons name="checkmark-sharp" size={24} color="white" /> Played</Text>
                        </TouchableOpacity>
                    </View>
                    <View>
                        <Text style={styles.detailsHeader}>About</Text>
                        <Text style={styles.summary}>{game.summary}</Text>
                    </View>
                    <View style={styles.details}>
                        {/* generes section */}
                        {game.genres && (
                            <View style={styles.textCard}>
                                <Text style={styles.detailsHeader}>Genres</Text>
                                {game.genres.map((genre) => (
                                    <View key={genre.id}>
                                        <Text style={styles.detailsText}>{genre.name}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                        {/* Game mode section */}
                        {game.game_modes && (
                            <View style={styles.textCard}>
                                <Text style={styles.detailsHeader}>Game Modes</Text>
                                {game.game_modes.map((mode) => (
                                    <View key={mode.id}>
                                        <Text style={styles.detailsText}>{mode.name}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                        {game.involved_companies && (
                            <>
                                {/* Developers section*/}
                                {game.involved_companies.some(company => company.developer) && (
                                    <View style={styles.textCard}>
                                        <Text style={styles.detailsHeader}>Developer</Text>
                                        {game.involved_companies
                                            .filter(company => company.developer)
                                            .map(company => (
                                                <Text key={company.id} style={styles.detailsText}>
                                                    {company.company.name}
                                                </Text>
                                            ))}
                                    </View>
                                )}

                                {/* Publishers section*/}
                                {game.involved_companies.some(company => company.publisher) && (
                                    <View style={styles.textCard}>
                                        <Text style={styles.detailsHeader}>Publisher</Text>
                                        {game.involved_companies
                                            .filter(company => company.publisher)
                                            .map(company => (
                                                <Text key={company.id} style={styles.detailsText}>
                                                    {company.company.name}
                                                </Text>
                                            ))}
                                    </View>
                                )}
                            </>
                        )}
                        {/* language supports section*/}
                        {game.language_supports && (
                            <>
                                <View style={styles.textCard}>
                                    <Text style={styles.detailsHeader}>Language Supports</Text>
                                    {["Audio", "Subtitles", "Interface"].map((type) => {
                                        const langs = game.language_supports
                                            ?.filter(l => l.language_support_type.name === type)
                                            .map(l => l.language.name);

                                        return langs.length ? (
                                            <Text key={type} style={styles.langs}>
                                                {/* {type}: {langs.join(", ")} */}
                                                <Text style={styles.detailsText}>{type}:</Text> {langs.join(", ")}
                                            </Text>
                                        ) : null;
                                    })}
                                </View>
                            </>
                        )}
                        {/* Game Engines section */}
                        {game.game_engines && (
                            <View style={styles.textCard}>
                                <Text style={styles.detailsHeader}>Game Engines</Text>
                                {game.game_engines.map((engine) => (
                                    <View key={engine.id}>
                                        <Text style={styles.detailsText}>{engine.name}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                    {game.videos &&
                        <View style={styles.trailerContainer}>
                            {(() => {
                                const trailer =
                                    game.videos.find(v => v.name === "Trailer") ||
                                    game.videos.find(v => v.name === "Announcement Trailer") ||
                                    game.videos.find(v => v.name === "Teaser") ||
                                    game.videos.find(v => v.name === "Release Date Trailer") ||
                                    game.videos.find(v => v.name === "Gameplay Trailer");
                                if (trailer?.video_id) {
                                    return (
                                        <>
                                            <Text style={styles.detailsHeader}>Game Trailer</Text>
                                            <View style={styles.ytVid}>
                                                <YoutubePlayer
                                                    height={300}
                                                    videoId={trailer.video_id}
                                                />
                                            </View>
                                        </>
                                    );
                                }
                                return null;
                            })()}
                        </View>

                    }
                </View>

            </ScrollView>

            <ImageBackground blurRadius={2} source={game.cover
                ? { uri: `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg` }
                : null} style={{ height: "100%", width: "100%", flex: 1, opacity: .4, position: "absolute", zIndex: -100 }} >
                {/* <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill}></BlurView> */}
            </ImageBackground>
        </Modal>
    );
}
export default GameDetails;

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        //   backgroundColor: "#0c1a33",
    },
    backgroundContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: "100%",
    },
    gradient: {
        height: "100%",
        width: "30%"
    },
    header: {
        position: "absolute",
        width: 40,
        height: 40,
        top: 30,
        left: 10,
        zIndex: 1000,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(81, 105, 150, 0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        flex: 1,
    },
    image: {
        width: "100%",
        height: 350,
        resizeMode: "cover",
        zIndex: 100
    },
    content: {
        padding: 15,
        paddingBottom: 40,
        // width: "100%",
    },
    title: {
        color: "white",
        fontSize: 24,
        fontWeight: "bold",
        // lineHeight: 32,
        // textAlign: "center",
    },
    releaseDate: {
        color: "gray",
        letterSpacing: 2

    },
    contentHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    platformContainer: {
        flexDirection: "row",
        alignItems: "center",
        // height: "100%",
        flexWrap: "wrap",
        flex: 1,
        // justifyContent: "flex-end"
    },
    platform: {
        color: "white",
        fontSize: 17,
        fontWeight: "500",
        backgroundColor: "rgb(81, 105,150, 0.3)",
        paddingVertical: 3,
        paddingHorizontal: 10,
        marginRight: 10,
        marginBottom: 10,
        borderRadius: 14,
    },
    rating: {
        color: "white",
        // backgroundColor: "#516996",
        textAlign: "center",
        borderRadius: 50,
        textAlignVertical: "center",
        width: 70,
        height: 70,
        fontSize: 34,
        fontWeight: "bold",
    },
    storesHeader: {
        color: "white",
        fontWeight: "600",
        fontSize: 24,
        marginBottom: 10,
        marginTop: 5
    },
    storesContainer: {
        flexDirection: "row",
        flexWrap: "wrap"
    },
    storesBtn: {
        backgroundColor: "#516996",
        borderWidth: 1,
        borderColor: "gray",
        borderRadius: 12,
        marginRight: 10,
        width: 60,
        height: 60,
        alignItems: "center",
        justifyContent: "center"
    },
    storeImg: {
        borderRadius: 12,
        width: 50,
        height: 50,

    },
    playContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        margin: 10,
        marginTop: 20
    },
    wantBtn: {
        flex: 1,
        backgroundColor: "#516996",
        borderRadius: 8,
        marginRight: 10,
        padding: 8
    },
    wantBtnText: {
        color: "white",
        textAlign: "center",
        fontSize: 24,
        fontWeight: "600"
    },
    playedBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#516996",
        borderRadius: 8,
        padding: 8
    },
    playedBtnText: {
        color: "white",
        textAlign: "center",
        fontSize: 24,
        fontWeight: "600"
    },
    details: {
        flexDirection: "row",
        justifyContent: "space-between",
        flexWrap: "wrap"
    },
    textCard: {
        // marginRight: 25
        width: "50%"
    },
    detailsHeader: {
        color: "white",
        fontSize: 24,
        fontWeight: "600",
        textDecorationLine: "underline",
        marginTop: 10,
    },
    detailsText: {
        color: "#9f9f9f",
        fontSize: 20,
        fontWeight: "600",
        marginLeft: 3,
        flexWrap: "wrap"
    },
    summary: {
        color: "#c1c1c1",
        fontSize: 16,
        marginTop: 5
    },
    langs: {
        color: "#9f9f9f",
    },

    trailerContainer: {
        marginTop: 20
    },
    ytVid: {
        marginTop: 20,
    }
});

