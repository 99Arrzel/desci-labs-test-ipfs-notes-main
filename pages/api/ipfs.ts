// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import { create } from "ipfs-http-client";

// arbitrary response format
export type BasicIpfsData = {
  cid: string;
  content: string;
};
export type IpfsCID = {
  cid: string;
  time: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BasicIpfsData | IpfsCID[]>
) {
  if (req.method === "POST") {
    // Process a POST request, insert
    //if has hash, retrieve data by hash, else insert data
    if(req.body.cid){
      console.log("Retrieving data by hash")
      retrieveDataByHash(req, res);
      return;
    }
    console.log("Inserting data")
    insertData(req, res);

  }
  //There will be a GET request to retrieve data, others are POST 
  else {
    //All list in json
    console.log("Retrieving data")
    lookUpDataInJson(req, res);
  }
}

const retrieveDataByHash = async (
  req: NextApiRequest,
  res: NextApiResponse<BasicIpfsData>
) => {
  const client = create();
  //Must insert data into the IPFS network
  const hashOfData = req.body.cid;
  const data = await client.cat(hashOfData);
  
  //data is a buffer, we need to convert it to string
  const chunks = [] ;
  for await (const chunk of data) { //IDK why is async
    chunks.push(chunk);
  }
  const mergedChunks = Buffer.concat(chunks);
  let dataAsString = mergedChunks.toString();
  console.log("Data retrieved by hash", dataAsString)
  res.status(200).json({ cid: hashOfData, content: dataAsString });
}

const insertData = async (
  req: NextApiRequest,
  res: NextApiResponse<BasicIpfsData>
) => {
  // connect to the default API address http://localhost:5001
  const client = create();
  const message = req.body.message;  
  // call Core API methods
  const data = await client.add(message);
  //We save data in a json file, just CID(PATH) and time
  const dataToSave = {cid: data.path, time: new Date().toISOString()};
  //await fs.appendFileSync("../../data.json", JSON.stringify(dataToSave));
  const readedFile = await fs.readFileSync("./data.json")
  const fileAsString = readedFile.toString();
  console.log("-----------------")
  console.log(fileAsString)
  console.log("-----------------")
  let dataReaded = JSON.parse(fileAsString).data as IpfsCID[];
  dataReaded.push(dataToSave);
  console.log("Data saved in data.json", dataToSave)
  await fs.writeFileSync("./data.json", JSON.stringify({data: dataReaded}));
  res.status(200).json({ cid: data.path, content: message });
};
const lookUpDataInJson = async (
  req: NextApiRequest,
  res: NextApiResponse<IpfsCID[]>
) => {
  //We save data in a json file
  const file = await fs.readFileSync("./data.json");
  const fileToString = file.toString();
  console.log(fileToString, "Data readed")
  const data = JSON.parse(fileToString).data as IpfsCID[];
  res.status(200).json(data);

}