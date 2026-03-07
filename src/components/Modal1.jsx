import ReactDom from 'react-dom'

export default function Modal1(props) {

    const {children, handleCloseModal } = props
    
    return ReactDom.createPortal (
        
        <div class="modal-container">
            <button onClick={handleCloseModal} className="modal-underlay"/>
            <div className="modal-content">
                { children}
            </div>
        </div>,
        document.getElementById('portal1')
    )
}