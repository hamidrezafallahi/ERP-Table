import { useState, useEffect } from "react";
import { FormInstance } from "antd";

interface UseFormChangeFieldsProps<T> {
  setInitialValues: (values: T) => void;
  reset: () => void;
  changeFields: string[];
  setChangeFields: React.Dispatch<React.SetStateAction<string[]>>;
}

export function useFormChangeFields<T extends Record<string, any>>(
  form: FormInstance<T>,
  formValues: T
): UseFormChangeFieldsProps<T> {
  const [originalValues, setOriginalValues] = useState<T | null>(null);
  const [changeFields, setChangeFields] = useState<string[]>([]);

  const setInitialValues = (values: T) => {
    setOriginalValues(values);
    form.setFieldsValue(values as any);
    setChangeFields([]);
  };

  const reset = () => {
    if (originalValues) {
      form.setFieldsValue(originalValues as any);
    } else {
      form.resetFields();
    }
    setChangeFields([]);
  };

  useEffect(() => {
    if (!originalValues || !formValues) return;
    const changed: string[] = [];
    for (const key in formValues) {
      if (originalValues[key] !== formValues[key]) {
        changed.push(key);
      }
    }
    setChangeFields(changed);
  }, [formValues, originalValues]);

  return {
    setInitialValues,
    reset,
    changeFields,
    setChangeFields,
  };
}
