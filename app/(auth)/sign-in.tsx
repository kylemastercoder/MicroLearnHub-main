import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";

import { images } from "@/constants";
import { useSignIn } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import Mail from "react-native-vector-icons/Entypo";
import Locked from "react-native-vector-icons/Fontisto";

const SignIn = () => {
  const { signIn, setActive, isLoaded } = useSignIn();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(root)/(tabs)/home");
      } else {
        console.log(JSON.stringify(signInAttempt, null, 2));
        Alert.alert("Error", "Log in failed. Please try again.");
      }
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      Alert.alert("Error", err.errors[0].longMessage);
    }
  }, [isLoaded, signIn, form.email, form.password, setActive]);

  return (
    <ScrollView className="flex-1 bg-[#8fad44]">
      <View className="p-7 mt-40">
        <View className="p-5 border-4 rounded-3xl bg-white border-[#5e7119]">
          <Image source={images.logoAuth} className="w-60 h-20 self-center" />
          <Text className="font-semibold text-2xl text-center mb-4 mt-8 text-[#5e7119]">
            LOGIN
          </Text>
          <InputField
            icon={<Mail color="#5e7119" size={18} name="mail" />}
            placeholder="Email"
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />
          <InputField
            icon={<Locked color="#5e7119" size={18} name="locked" />}
            placeholder="Password"
            isPassword
            onChangeText={(value) => setForm({ ...form, password: value })}
          />
          <CustomButton
            title="Login"
            onPress={onSignInPress}
            className="mt-6"
            bgVariant="success"
          />
          <Link
            href="/sign-up"
            className="text-md text-center text-general-200 mt-5"
          >
            Don&apos;t have an account?{" "}
            <Text className="font-semibold text-[#5e7119]">Sign up</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignIn;
