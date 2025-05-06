const db= require("../config/db");

const getHostels=async(req,res)=>{
    try {
        const data=await db.query('SELECT * FROM hostels')
        if(!data){
            return res.status(404).send({
                success :false,
                message:"No record Found ..."
            });
        }
        res.status(200).send({
            success:true,
            message:"All Hostel Record found ....",
            totalStudents:data[0].length,
            data:data[0]
        })

    } catch (error) {
        console.log(error);
        res.status(400).send({
            success : false,
            message : 'Error in Get the hostel API ...',
            error
        })
    }
};

const getHostelsById=async(req,res)=>{
    try {
        const hostelID=req.params.id;
        const data=await db.query('SELECT * FROM hostels WHERE id=?',[hostelID]);
        if(!data){
            return res.status(404).send({
                success :false,
                message:"No record Found ..."
            });
        }
        res.status(200).send({
            success:true,
            HostelDetails:data[0]
        })
        
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success : false,
            message : 'Error in Get the hostel API ...',
            error
        })
        
    }

}
const createHostel = async (req, res) => {
    try {
      const { name, gender ,warden_name} = req.body;
  
      if (!name || !gender) {
        return res.status(400).send({
          success: false,
          message: "Please provide both hostel name and gender",
        });
      }
  
      const [result] = await db.query(
        "INSERT INTO hostels (name, gender, warden_name) VALUES (?, ?, ?)",
        [name, gender,warden_name]
      );
  
      res.status(201).send({
        success: true,
        message: "Hostel created successfully",
        hostelId: result.insertId,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error while creating hostel",
        error,
      });
    }
  };
  
  const updateHostel = async (req, res) => {
    try {
      const hostelID = req.params.id;
      const { name, gender } = req.body;
  
      const [result] = await db.query(
        "UPDATE hostels SET name = ?, gender = ? WHERE id = ?",
        [name, gender, hostelID]
      );
  
      res.status(200).send({
        success: true,
        message: "Hostel updated successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error while updating hostel",
        error,
      });
    }
  };
  
  const deleteHostel = async (req, res) => {
    try {
      const hostelID = req.params.id;
  
      const [result] = await db.query("DELETE FROM hostels WHERE id = ?", [
        hostelID,
      ]);
  
      res.status(200).send({
        success: true,
        message: "Hostel deleted successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error while deleting hostel",
        error,
      });
    }
  };
  

module.exports={getHostels,getHostelsById,createHostel,updateHostel,deleteHostel}