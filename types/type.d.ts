import { TextInputProps, TouchableOpacityProps } from "react-native";

declare interface ButtonProps extends TouchableOpacityProps {
  title: string;
  bgVariant?: "primary" | "secondary" | "danger" | "outline" | "success";
  textVariant?: "primary" | "default" | "secondary" | "danger" | "success";
  IconLeft?: React.ComponentType<any> | React.ReactNode;
  IconRight?: React.ComponentType<any>;
  className?: string;
  isLoading?: boolean;
}

declare interface InputFieldProps extends TextInputProps {
  icon?: any;
  secureTextEntry?: boolean;
  containerStyle?: string;
  inputStyle?: string;
  iconStyle?: string;
  className?: string;
  isDateInput?: boolean;
  isPassword?: boolean;
  dateValue?: string;
  isLoading?: boolean;
  onDateChange?: (date: string) => void;
}
