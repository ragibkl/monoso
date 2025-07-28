import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ReactNode,
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";

type ProviderProps = {
  children: ReactNode | ReactNode[];
};

export function createDataStore<T>(dataKey: string, initialValue: T) {
  async function load(): Promise<T> {
    const json = await AsyncStorage.getItem(dataKey);
    if (!json) {
      return initialValue;
    }
    return JSON.parse(json) as T;
  }

  async function save(data: T): Promise<void> {
    const json = JSON.stringify(data);
    await AsyncStorage.setItem(dataKey, json);
  }

  const DataContext = createContext<T>(initialValue);
  const SetDataContext = createContext<(d: T) => void>((_d) => {});

  function Provider(props: ProviderProps) {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [data, setDataState] = useState<T>(initialValue);

    useEffect(() => {
      async function effect() {
        const dataLoad = await load();
        setDataState(dataLoad);
        setIsLoading(false);
      }

      effect();
    }, []);

    const setData = useCallback(async (newData: T) => {
      await save(newData);
      setDataState(newData);
    }, []);

    return (
      <DataContext.Provider value={data}>
        <SetDataContext.Provider value={setData}>
          {isLoading ? <></> : props.children}
        </SetDataContext.Provider>
      </DataContext.Provider>
    );
  }

  function use() {
    const data = useContext(DataContext);
    const setData = useContext(SetDataContext);

    return { data, setData };
  }

  return {
    load,
    save,
    Provider,
    use,
  };
}
