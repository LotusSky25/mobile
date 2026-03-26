//import all needed components
import {useState, useEffect} from "react"
import Auth from './Auth'
import { getDocs, collection, doc, setDoc} from "firebase/firestore"
import { db } from "../../firebase"
import { useAuth } from "../context/AuthContext"

export default function Input(){
    //define needed constants 
    const [studentData, setStudentData] = useState([])
    const [selectedButtons, setSelectedButtons] = useState(new Set())
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [targetGroup, setTargetGroup] = useState("")
    const [showGroups, setShowGroups] = useState(true)
    const [name, setName] = useState("")
    const [groups, setGroups] = useState([])
    const [addNewStudent, setAddNewStudent] = useState(false)
    const {session} = useAuth()
    const multiselectOption = (option) => {
        //copy existing set
        const copy = new Set(selectedButtons);
        //if button already selected, deselect
        if (copy.has(option)) {
            copy.delete(option)
        } 
        //if button not yet selected, select (add to Set)
        else {
            copy.add(option)
        }
        //replace old Set with updated copy
        setSelectedButtons(copy)
    }
    //query data from firestore database
    async function fetchData(col) {
        try {
            const querySnapshot = await getDocs(collection(db, col))
            //empty array for data
            const data = []
            //push each student doc into the data array
            querySnapshot.forEach((doc)=> {
                data.push({id: doc.id, ...doc.data()})
            })
            return data //this is an array of objects
        } catch (err) {
            console.log(err)
        }
    }
    useEffect(()=>{
        async function getData(){
            //call fetchData to send query to firestore
            const data2 = await fetchData("students")
            const data3 = await fetchData("groups")
            //update useState to be mapped below
            setStudentData(data2)
            setGroups(data3)
        }
        getData()
        
    }, [])
    async function handleSubmit() {
            try {
                const roll = Array.from(selectedButtons)
                //create new doc for current session
                const docRef = doc(db, 'sessions', session)
                const res = await setDoc(docRef, {
                    //map wanted info about student to db
                    timestamp: Date.now(),
                    [targetGroup]: roll.map(student => ({
                        name: student.name,
                        group: student.group
                    }))
                }, {merge: true})
                //update each student's  
                 roll.forEach(async(student) => {
                    const pRef = doc(db, "students", student.name, "history", "DEMO")
                    const timestamp = Date.now()
                    const pRes = await setDoc(pRef, {
                        [timestamp]: session,

                    },{merge: true})
                })
                setIsSubmitted(true)
                setSelectedButtons([])
                setTargetGroup("")
            } catch (err) {
                console.log(err.message)
            }
        }

    return (
        <>
            {showGroups &&(<div class="group-select">
                <h2>Choose your group</h2>
                {groups.map(function(group, idx){
                    return(
                        <button class={"group-button" + "-"+group.group} key={idx} onClick={()=>{setTargetGroup(group.group), setShowGroups(false)}}><p>{group.group}</p></button>
                    )
                })}
            </div>)}
                
                {!isSubmitted&&targetGroup != "" &&(
                    <div class="roll">
                        <div class="roll-header">
                            <button class="back-button-roll"><i class="fa-solid fa-arrow-left" onClick={()=>{setTargetGroup(""), setShowGroups(true)}}></i></button>
                            <h2>Take the roll:</h2>
                        </div>
                    {/*map data from firebase (now as State) into buttons */}
                    {studentData.map(function(student, option){
                        if (student.group == targetGroup){
                            return( <button 
                                //sexy interactive buttons
                                class={"roll-button" + (selectedButtons.has(student) ? "-selected" : "") + "-"+targetGroup}
                                key={option}
                                type="button"
                                /*when clicked, send option to the multiselectOption and select/deselect as necessary */
                                onClick={()=>multiselectOption(student)}><p>{student.name}</p></button>)
                        }
                        
                    })}
                    <button class="edit-button" onClick={()=>{setAddNewStudent(!addNewStudent)}}><p>New Student?</p></button>
                    {addNewStudent&&(<div class="add-student-roll">
                        <h2>New student?</h2>
                        <p>Let the coordinator know by entering their details here</p>
                        <p>Student Name</p>
                        <input value={name} onChange={(e)=>{setName(e.target.value)}} placeholder="Name"></input>
                        <button class={"add-student-button-"+targetGroup} onClick={()=>{
                            const newStudent = {name: name, group: targetGroup}
                         multiselectOption(newStudent)
                         }}><p>Add Student</p></button>
                    </div>)}
                    <button onClick={handleSubmit} class="submit-roll-button"> 
                    <p>Submit</p>
                </button>
                </div>)}
                {isSubmitted&&(
                    <div class="roll">
                        <h4>Roll Submitted Successfully!</h4>
                        <button onClick={()=>{setIsSubmitted(false), setShowGroups(true)}}>Return</button>
                    </div>
                )}
        </>
    )
}
