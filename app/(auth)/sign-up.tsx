import { useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import ReactNativeModal from "react-native-modal";
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { images } from "@/constants";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import Mail from "react-native-vector-icons/Entypo";
import Locked from "react-native-vector-icons/Fontisto";
import UserAlt from "react-native-vector-icons/FontAwesome5";
import CheckCircle from "react-native-vector-icons/AntDesign";
import { formatDateToDDMMYYYY } from "@/lib/utils";

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    if (form.password !== form.confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerification({ ...verification, state: "pending" });
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      Alert.alert("Error", err.errors[0]?.longMessage || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });
      if (
        completeSignUp.status === "complete" &&
        completeSignUp.createdUserId
      ) {
        // passing to the backend
        await addDoc(collection(db, "Users"), {
          name: form.name,
          email: form.email,
          password: form.password,
          clerkId: completeSignUp.createdUserId,
          profile: "",
          birthday: "",
          createdAt: formatDateToDDMMYYYY(new Date()),
        });
        await setActive({ session: completeSignUp.createdSessionId });
        setVerification({ ...verification, state: "success" });
      } else {
        setVerification({
          ...verification,
          error: "Verification failed. Please try again.",
          state: "failed",
        });
      }
    } catch (err: any) {
      setVerification({
        ...verification,
        error: err.errors[0]?.longMessage || "An error occurred.",
        state: "failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#8fad44]">
      <View className="p-7 mt-24">
        <View className="p-5 border-4 rounded-3xl bg-white border-[#5e7119]">
          <Image source={images.logoAuth} className="w-60 h-20 self-center" />
          <Text className="font-semibold text-2xl text-center mb-4 mt-8 text-[#5e7119]">
            SIGN UP
          </Text>
          <InputField
            icon={<UserAlt color="#5e7119" size={16} name="user-alt" />}
            placeholder="Full Name"
            value={form.name}
            isLoading={isLoading}
            onChangeText={(value) => setForm({ ...form, name: value })}
          />
          <InputField
            icon={<Mail color="#5e7119" size={18} name="mail" />}
            placeholder="Email"
            textContentType="emailAddress"
            value={form.email}
            isLoading={isLoading}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />
          <InputField
            icon={<Locked color="#5e7119" size={18} name="locked" />}
            placeholder="Password"
            isLoading={isLoading}
            isPassword
            onChangeText={(value) => setForm({ ...form, password: value })}
          />
          <InputField
            icon={<Locked color="#5e7119" size={18} name="locked" />}
            placeholder="Confirm Password"
            isLoading={isLoading}
            isPassword
            onChangeText={(value) =>
              setForm({ ...form, confirmPassword: value })
            }
          />
          <CustomButton
            title="Sign Up"
            isLoading={isLoading}
            onPress={onSignUpPress}
            className="mt-6"
          />
          <Link
            href="/sign-in"
            className="text-md text-center text-general-200 mt-5"
          >
            Already have an account?{" "}
            <Text className="font-semibold text-[#5e7119]">Login</Text>
          </Link>
        </View>
      </View>
      <ReactNativeModal
        isVisible={verification.state === "pending"}
        // onBackdropPress={() =>
        //   setVerification({ ...verification, state: "default" })
        // }
        onModalHide={() => {
          if (verification.state === "success") {
            setShowSuccessModal(true);
          }
        }}
      >
        <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
          <Text className="font-JakartaExtraBold text-2xl mb-2">
            Verification
          </Text>
          <Text className="font-Jakarta mb-5">
            We've sent a verification code to {form.email}.
          </Text>
          <InputField
            icon={<Locked color="#5e7119" size={18} name="locked" />}
            placeholder={"OTP Code"}
            value={verification.code}
            keyboardType="numeric"
            isLoading={isLoading}
            onChangeText={(code) => setVerification({ ...verification, code })}
          />
          {verification.error && (
            <Text className="text-red-500 text-sm mt-1">
              {verification.error}
            </Text>
          )}
          <CustomButton
            isLoading={isLoading}
            title="Verify Email"
            onPress={onPressVerify}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
      <ReactNativeModal isVisible={showSuccessModal}>
        <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
          <View className="mx-auto mb-3">
            <CheckCircle name="checkcircle" size={60} color="#5e7119" />
          </View>
          <Text className="text-3xl font-JakartaBold text-center">
            Verified
          </Text>
          <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
            You have successfully verified your account.
          </Text>
          <CustomButton
            title="Browse Home"
            onPress={() => router.push(`/(root)/(tabs)/home`)}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </ScrollView>
  );
};

export default SignUp;
