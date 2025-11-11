import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import GameDetails from "./GameDetails.js"
import Loading from '../Loading'

const SERVER_URL = 'http://192.168.1.102:3000';

export default function GamesList({ endpoint }) {
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);
  const [selectedGameId, setSelectedGameId] = useState(null);
  useEffect(() => {
    fetchGames(endpoint);
  }, [endpoint]);

  const fetchGames = async () => {
    setLoading(true);
    setGames([]);
    setError(null);
    const url = `${SERVER_URL}${endpoint}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Server returned status: ${res.status}`);
      const data = await res.json();
      setGames(data);
    } catch (e) {
      console.error(e);
      setError('فشل الاتصال بالسيرفر. تأكد أن السيرفر يعمل وأنك تستخدم الـ IP الصحيح.');
    }
    setLoading(false);
  };
  // console.log(String(games?.[0]?.platforms))
  function formatPath(text) {
    return text
      .replace(/^\/+|\/+$/g, '')
      .split('/')
      .flatMap(part => part.split('-'))
      .filter(Boolean)
      .map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(' ');
  }
  function getRatingColor(rating) {
    if (rating <= 2) return '#8B0000';
    if (rating <= 4) return '#FF4C4C';
    if (rating <= 6) return '#FFA500';
    if (rating <= 8) return '#71e047';
    return '#006400';
  };
  const [activeModal, setActiveModal] = useState(false);
  const renderGame = ({ item }) => (
    <TouchableOpacity style={styles.gameCard} onPress={() => setSelectedGameId(item.id)
    }>

      <Image
        source={item.cover ? { uri: `https://images.igdb.com/igdb/image/upload/t_cover_big/${item.cover.image_id}.jpg` } : require("../assets/image-not-found.webp")}
        style={styles.cover}
      />
      {item.total_rating && <Text style={[
        styles.rating,
        { backgroundColor: getRatingColor(item.total_rating / 10) }
      ]}>{Math.round(item.total_rating) / 10}</Text>}

      <Text style={styles.title}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{formatPath(endpoint)}</Text>
      {loading && <Loading />}

      {error && <Text style={styles.error}>{error}</Text>}

      {!loading && !error && (
        <FlatList
          data={games}
          horizontal={true}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderGame}
          contentContainerStyle={{ paddingVertical: 12 }}
          showsHorizontalScrollIndicator={false}
        />
      )}

      <GameDetails
        gameID={selectedGameId}
        visible={selectedGameId !== null}
        onClose={() => setSelectedGameId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // container: { flex: 1, backgroundColor: '#1a1a1a' },
  header: { fontSize: 28, color: 'white', margin: 12, fontWeight: 'bold' },
  gameCard: {
    borderWidth: 1,
    borderColor: "#516996",
    padding: 10,
    borderRadius: 16,
    margin: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cover: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    textAlign: "center",
    width: 150
  },
  rating: {
    color: "white",
    position: "absolute",
    textAlign: "center",
    borderBottomLeftRadius: 16,
    borderTopRightRadius: 16,
    textAlignVertical: "center",
    width: 50,
    height: 50,
    top: 0,
    right: 0,
    fontSize: 20,
    fontWeight: "bold",
  },
  error: { color: '#ffcccc', textAlign: 'center', marginTop: 20, paddingHorizontal: 20 },
});
