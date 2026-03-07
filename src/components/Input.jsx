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
    const [groups, setGroups] = useState([])
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
                    const pRes = await setDoc(pRef, {
                        attended: session
                    })
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
            <h2>Choose your group</h2>
            {groups.map(function(group, idx){
                return(
                    <button class="group-button" key={idx} onClick={()=>{setTargetGroup(group.group)}}>{group.group}</button>
                )
            })}
            <h2>Take the roll:</h2>
            {!isSubmitted&&(<div class="roll">
                {/*map data from firebase (now as State) into buttons */}
                {studentData.map(function(student, option){
                    if (student.group == targetGroup){
                        return( <button 
                            //sexy interactive buttons
                            class={"roll-button" + (selectedButtons.has(student) ? "-selected" : "")}
                            key={option}
                            type="button"
                            /*when clicked, send option to the multiselectOption and select/deselect as necessary */
                            onClick={()=>multiselectOption(student)}><p>{student.name}</p></button>)
                    }
                    
                })}
                
                <button onClick={handleSubmit} class="submit-roll-button"> 
                <p>Submit</p>
            </button>
            </div>)}
            {isSubmitted&&(
                <div class="roll">
                    <h4>Roll Submitted Successfully!</h4>
                    <button onClick={()=>{setIsSubmitted(false)}}>Return</button>
                </div>
            )}
        </>
    )
}
