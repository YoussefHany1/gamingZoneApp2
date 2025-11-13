import { FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Slideshow from "../components/Slideshow";
import LatestNews from "../components/LatestNews";
// import Loading from "../Loading";

const sections = [
  <Slideshow website="arab_hardware" category="news" />,
  <LatestNews website="ign" category="news" limit={5} showDropdown={false} />,
  <LatestNews
    website="true_gaming"
    category="reviews"
    limit={5}
    showDropdown={false}
  />,
  <LatestNews
    website="dot_esports"
    category="esports"
    limit={5}
    showDropdown={false}
  />,
  <LatestNews
    website="tom_s_hardware"
    category="hardware"
    limit={5}
    showDropdown={false}
  />,
];

function Home() {
  const renderItem = ({ item }) => item;

  return (
    <>
      <SafeAreaView edges={['right', 'bottom', 'left']} style={styles.container}>
        <FlatList
          data={sections}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </>
  );
}
export default Home;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c1a33",
  },
});
