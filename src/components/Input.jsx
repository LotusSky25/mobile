//import all needed components
import {useState, useEffect, useCallback} from "react"
import Auth from './Auth'
import { getDocs, collection, doc, query, setDoc, where } from "firebase/firestore"
import { db } from "../../firebase"
import { useAuth } from "../context/AuthContext"

export default function Input(){
    //define constants needed for storing data
    const [studentData, setStudentData] = useState([])
    const [selectedButtons, setSelectedButtons] = useState(new Set())
    const [targetGroup, setTargetGroup] = useState("")
    const [name, setName] = useState("")
    const [groups, setGroups] = useState([])
    //define constants needed for conditional rendering
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [showGroups, setShowGroups] = useState(true)
    const [addNewStudent, setAddNewStudent] = useState(false)
    const [error, setError] = useState("")

    const {session, globalData, isLoading: isAuthLoading} = useAuth()

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
    //useCallback to prevent rerendering all the time (save entire function between renders)
    const fetchData = useCallback(async(col) => {
        try {
            if (!globalData?.code) return []
            const scopedQuery = query(
                collection(db, col),
                where("code", "==", globalData.code)
            )
            const querySnapshot = await getDocs(scopedQuery)
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
    }, [globalData?.code])
    //guard to prevent crash in case the user is (somehow) logged in without a code at all
    useEffect(()=>{
        setIsLoading(true)
        if (isAuthLoading) return
        if (!globalData?.code) {
            setStudentData([])
            setGroups([])
            return
        }

        async function getData(){
            //call fetchData to send query to firestore
            const data2 = await fetchData("students")
            const data3 = await fetchData("groups")
            //update useState to be mapped below
            //set empty if fetch failed/nothing to fetch to prevent crashes in render tree 
            setStudentData(data2 || [])
            setGroups(data3 || [])
        }
        getData()
        setIsLoading(false)
        
    }, [isAuthLoading, globalData?.code, fetchData])

    async function handleSubmit() {
            setError("")
            try {
                setIsLoading(true)
                if (!globalData?.code) {
                    setError("Missing access code. Please sign in again.")
                    return
                }
                const roll = Array.from(selectedButtons)
                //create new doc for current session
                const docRef = doc(db, 'sessions', session)
                await setDoc(docRef, {
                    //map wanted info about student to db
                    code: globalData.code,
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
                    await setDoc(pRef, {
                        [timestamp]: session,

                    },{merge: true})
                })
                //reset all the useStates
                setIsSubmitted(true)
                setSelectedButtons(new Set())
                setTargetGroup("")
            } catch (err) {
                console.log("Error fetching data:", err)
                if (err?.code === "permission-denied") {
                    setError("Insufficient database permissions.")
                } else {
                    setError("Unable to load data right now.")
                }
            } finally {
                setIsLoading(false)
            }
        }

    return (
        <>
            {// print any errors that have been set above
            error !="" && (
                <div class="error">
                    <p>❌ {error}</p>
                </div>
            )}
            {//show the group selection 
            showGroups &&(<div class="group-select">
                <h2>Choose your group</h2>
                {isLoading &&(<p>Loading...</p>)}
                {groups.map(function(group, idx){
                    return(
                        <button class={"group-button" + "-"+group.group} key={idx} onClick={()=>{setTargetGroup(group.group), setShowGroups(false)}}><p>{group.group}</p></button>
                    )
                })}
            </div>)}
                
                {!isSubmitted&&targetGroup != "" &&(
                    <div class="roll">
                        <div class="roll-header">
                            <button class="back-button-roll"><i class="fa-solid fa-arrow-left" onClick={()=>{setTargetGroup(""), setShowGroups(true), setAddNewStudent(false)}}></i></button>
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
                            const newStudent = {name: name, group: targetGroup, status: "unregistered"}
                        studentData.push(newStudent)
                         multiselectOption(newStudent)
                         }}><p>Add Student</p></button>
                    </div>)}
                    <button onClick={handleSubmit} class="submit-roll-button"> 
                    {isLoading ? (<p>Submitting...</p>):(<p>Submit</p>)}
                </button>
                </div>)}
                {isSubmitted&&(
                    <div className="roll-submitted">
                        <i className="fa-regular fa-circle-check fa-xl"></i>
                        <h4>Roll Submitted Successfully!</h4>
                        <button className="edit-return-button" onClick={()=>{setIsSubmitted(false), setShowGroups(true)}}><i className="fa-solid fa-arrow-left"></i>Return</button>
                    </div>
                )}
        </>
    )
}
