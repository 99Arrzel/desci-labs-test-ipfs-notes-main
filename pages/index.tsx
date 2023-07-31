import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import { useEffect, useState } from "react";
import axios from "axios";
import { BasicIpfsData, IpfsCID} from "./api/ipfs";
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BasicIpfsData | null>(null);
  const [ipfsIndex, setIpfsIndex] = useState<IpfsCID[]>([]);
  const [newNote, setNewNote] = useState("");

  const [note, setNote] = useState<BasicIpfsData | null>(null);
  const [txt, setTxt] = useState("");
  const handleLoadMessageByCID = async (cid: String) => {
    setLoading(true);
    const { data } = await axios.post("/api/ipfs/",
    {
      cid
    });
    alert(data.content);
    
    setLoading(false);
  }
  const handleSave = async () => {
    setLoading(true);
    const { data } = await axios.post("/api/ipfs", {
      message: newNote,
    });
    setResult(data);
    setNewNote("");
    handleLoadIndex();
    setLoading(false);
  }
  const handleLoad = async () => {
    setLoading(true);
    const { data } = await axios.get("/api/ipfs");
    setResult(data);
    
    setLoading(false);
  };
  const handleLoadIndex = async () => {
    setLoading(true);
    const { data } = await axios.get("/api/ipfs");
    setIpfsIndex(data);    
    setLoading(false);
  }
  
useEffect(() => {
  //At load, load the index
  handleLoadIndex();
}, []);

  // avoiding ternary operators for classes
  function classNames(...classes: any) {
    return classes.filter(Boolean).join(" ");
  }
  return (
    <>
      <Head>
        <title>IPFS Notes</title>
        <meta name="description" content="IPFS Notes" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex">
        <div className="flex flex-col gap-3 basis-1/2">
          <div className="text-3xl font-bold underline">IPFS Notes</div>
          {/* {!!result ? (
            <div className="flex flex-col">
              <span>Content: {result.content}</span>
              <span>CID: {result.cid}</span>
            </div>
          ) : null} */}
          {
            ipfsIndex.length > 0 ? ipfsIndex.map((ipfs, index) => {
              return (
                <div key={index} className="flex flex-col">
                  <span>CID: {ipfs.cid}</span>
                  <span>Date: {ipfs.time}</span>
                  <button
                    onClick={() => handleLoadMessageByCID(ipfs.cid)}
                    className={classNames(
                      "bg-slate-300 hover:bg-slate-500 text-black rounded-md p-2 drop-shadow-md w-32",
                      loading ? "animate-pulse" : ""
                    )}
                  >Load Note</button>
                </div>
              )
            }) : 
            <div className="flex flex-col">
              <span>No Data</span>
            </div>
          }
          
          <div>
            <button
              onClick={handleLoadIndex}
              className={classNames(
                "bg-slate-300 hover:bg-slate-500 text-black rounded-md p-2 drop-shadow-md w-32",
                loading ? "animate-pulse" : ""
              )}
            >
              {loading ? "Loading..." : "Retrieve All CIDs"}
            </button>
          </div>
        </div>
        <div className="flex basis-1/2">
          <div>
          <div className="text-3xl font-bold underline">New note</div>
            <textarea
              className="w-full h-96 border-2 border-slate-300 rounded-md p-2"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            ></textarea>
            <button className={classNames(
              "bg-slate-300 hover:bg-slate-500 text-black rounded-md p-2 drop-shadow-md w-32",
              loading ? "animate-pulse" : ""
            )}
            onClick={async () => {
              handleSave()
            }}
            disabled={loading}
            >
              Save
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
