import { db } from "@/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    setErrorMessage("");

    if (!phone || !password) {
      setErrorMessage("Please enter both phone and password.");
      return;
    }

    try {
      console.log("Starting Firestore query...");
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("phone", "==", phone),
        where("password", "==", password)
      );
      const querySnapshot = await getDocs(q);

      console.log("Query result:", querySnapshot.docs);

      if (!querySnapshot.empty) {
        const user = querySnapshot.docs[0].data(); // Lấy thông tin người dùng
        console.log("User data:", user);

        // Lưu thông tin người dùng vào AsyncStorage
        await AsyncStorage.setItem("user", JSON.stringify(user));

        router.replace("/(tabs)"); // Điều hướng đến màn hình chính
      } else {
        setErrorMessage("Invalid phone or password.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setErrorMessage("An error occurred while logging in.");
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/5fd034f83aed7-removebg-preview.png')} style={styles.logo} />
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Phone"
        placeholderTextColor="#666"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder="Password"
          placeholderTextColor="#666"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={togglePasswordVisibility}
        >
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={24}
            color="#007AFF"
          />
        </TouchableOpacity>
      </View>

      {/* Hiển thị thông báo lỗi */}
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

// ... phần import và component không đổi

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E6F0FA", // Nền xanh nhạt
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#007AFF", // Xanh đậm
    marginBottom: 32,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#333",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#007AFF", // Viền xanh
  },
  passwordContainer: {
    width: "100%",
    position: "relative",
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 13,
  },
  loginButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#007AFF", // Màu xanh đậm
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});
