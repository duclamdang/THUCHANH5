import { db } from "@/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

export default function ServiceListScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        router.replace("/login");
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "services"));
        const servicesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setServices(servicesData);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
  }, []);

  const handleAddService = async () => {
    if (!serviceName || !servicePrice) {
      alert("Hãy nhập đầy đủ thông tin dịch vụ!");
      return;
    }

    try {
      const newService = {
        name: serviceName,
        price: servicePrice,
        creator: user?.fullName || "Unknown",
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "services"), newService);
      await updateDoc(docRef, { id: docRef.id });

      setServices((prev) => [...prev, { id: docRef.id, ...newService }]);
      setModalVisible(false);
      setServiceName("");
      setServicePrice("");
    } catch (error) {
      console.error("Error adding service:", error);
    }
  };

  const handleUpdateService = async () => {
    if (!selectedService) return;

    try {
      const serviceRef = doc(db, "services", selectedService.id);
      await updateDoc(serviceRef, {
        name: serviceName,
        price: servicePrice,
      });

      setServices((prev) =>
        prev.map((s) =>
          s.id === selectedService.id ? { ...s, name: serviceName, price: servicePrice } : s
        )
      );

      setModalVisible(false);
      setSelectedService(null);
      setServiceName("");
      setServicePrice("");
    } catch (error) {
      console.error("Error updating service:", error);
    }
  };

  const handleDeleteService = async () => {
    if (!selectedService) return;

    try {
      await deleteDoc(doc(db, "services", selectedService.id));
      setServices((prev) => prev.filter((s) => s.id !== selectedService.id));

      setModalVisible(false);
      setSelectedService(null);
      setServiceName("");
      setServicePrice("");
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      router.replace("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const openAddModal = () => {
    setSelectedService(null);
    setServiceName("");
    setServicePrice("");
    setModalVisible(true);
  };

  const handleSelectService = (service) => {
    setSelectedService(service);
    setServiceName(service.name);
    setServicePrice(service.price);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleSelectService(item)}>
      <View style={styles.card}>
        <Text style={styles.serviceTitle}>{item.name}</Text>
        <Text style={styles.servicePrice}>{parseInt(item.price).toLocaleString("vi-VN")}đ</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Image source={require("@/assets/images/react-logo.png")} style={styles.logo} />
        <Text style={styles.title}>Dịch Vụ</Text>
        <View style={styles.topActions}>
          <TouchableOpacity onPress={() => setUserModalVisible(true)} style={styles.circleButton}>
            <Icon name="user" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={openAddModal} style={[styles.circleButton, { marginLeft: 10 }]}> 
            <Text style={styles.addIcon}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />

      {/* User Modal */}
      <Modal visible={userModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Thông tin người dùng</Text>
            {user && (
              <>
                <Text style={styles.modalText}>Họ tên: {user.fullName}</Text>
                <Text style={styles.modalText}>SĐT: {user.phone}</Text>
              </>
            )}
            <TouchableOpacity style={[styles.button, { backgroundColor: "red" }]} onPress={handleLogout}>
              <Text style={styles.buttonText}>Đăng xuất</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setUserModalVisible(false)}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalBox}>
            <Text style={styles.modalTitle}>{selectedService ? "Cập nhật" : "Thêm dịch vụ"}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
            <TextInput
              placeholder="Tên dịch vụ"
              style={styles.input}
              value={serviceName}
              onChangeText={setServiceName}
            />
            <TextInput
              placeholder="Giá"
              style={styles.input}
              keyboardType="numeric"
              value={servicePrice}
              onChangeText={setServicePrice}
            />
            {selectedService && (
              <>
                <Text style={styles.metaText}>Người tạo: {selectedService.creator}</Text>
                <Text style={styles.metaText}>
                  Ngày tạo: {new Date(selectedService.createdAt).toLocaleString("vi-VN")}
                </Text>
              </>
            )}
            <TouchableOpacity style={styles.button} onPress={selectedService ? handleUpdateService : handleAddService}>
              <Text style={styles.buttonText}>{selectedService ? "Cập nhật" : "Thêm"}</Text>
            </TouchableOpacity>
            {selectedService && (
              <TouchableOpacity style={[styles.button, { backgroundColor: "#dc3545" }]} onPress={handleDeleteService}>
                <Text style={styles.buttonText}>Xóa</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    elevation: 3,
  },
  logo: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#231fe0",
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  circleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#231fe0",
    justifyContent: "center",
    alignItems: "center",
  },
  addIcon: {
    fontSize: 22,
    color: "#fff",
  },
  listContent: {
    padding: 12,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  servicePrice: {
    fontSize: 15,
    color: "#231fe0",
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    position: "relative",
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#231fe0",
    marginBottom: 16,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  metaText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 15,
  },
  button: {
    backgroundColor: "#231fe0",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  closeText: {
    fontSize: 22,
    color: "#888",
  },
});
