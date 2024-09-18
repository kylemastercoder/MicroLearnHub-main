import {
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";

import { InputFieldProps } from "@/types/type";
import { useState } from "react";
import Eye from "react-native-vector-icons/Ionicons";
import EyeOff from "react-native-vector-icons/Ionicons";

const InputField = ({
  icon,
  secureTextEntry = false,
  containerStyle,
  inputStyle,
  iconStyle,
  className,
  onChangeText,
  isLoading,
  isPassword = false,
  ...props
}: InputFieldProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View className="my-2 w-full">
        <View
          className={`flex flex-row justify-start items-center relative ${isLoading ? "bg-gray-300" : ""} shadow-lg rounded-md border border-neutral-400 focus:border-[#5e7119]  ${containerStyle}`}
        >
          {icon && <View className={`ml-4 ${iconStyle}`}>{icon}</View>}
          <TextInput
            className={`rounded-md py-2 px-2 flex-1 ${inputStyle} text-left`}
            secureTextEntry={isPassword && !isPasswordVisible}
            style={{ flexShrink: 0 }}
            readOnly={isLoading}
            onChangeText={onChangeText}
            disableFullscreenUI={isLoading}
            {...props}
          />
          {isPassword && (
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              className="mr-2"
            >
              {isPasswordVisible ? (
                <Eye name="eye" size={18} color="#777" />
              ) : (
                <EyeOff name="eye-off" size={18} color="#777" />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default InputField;
