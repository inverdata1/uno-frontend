import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#e50323",
    },
    containerInSAV: {
        flex: 1,
        padding: 20,
        backgroundColor: "#e50323",
    },
    scrollContainer: {
        flexGrow: 1, 
        paddingBottom: 20,
        backgroundColor: "#e50323",
    },
    top: {
        flex: 0.3,
        padding: 10,
    },
    top2: {
        flex: 0.05,
        padding: 10,
    },
    form: {
        padding: 20,
        borderWidth: 1.5,
        borderRadius: 16,
        borderColor: "#fefefe",
        alignSelf: 'flex-start',
        width: '100%',
    },
    bottom: {
        flex: 1,
        padding: 30,
    },
    modeText: {
        fontWeight: "bold",
        fontSize: 24,
        textAlign: "center",
        color: "#fefefe",
    },
    formHeader:{
        fontWeight: "bold",
        fontSize: 22,
        marginBottom: 14,
        textAlign: "center",
        color: '#fefefe',
    },
    inputContainer: {
        marginTop: 5,
        marginBottom: 15,
    },
    inputLabel: {
        fontWeight: "bold",
        fontSize: 17,
        marginBottom: 3,
        color: '#fefefe',
    },
    inputWrapper: {
        position: "relative",
        borderBottomColor: "#fefefe",
    },
    input: {
        height: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#fefefe',
        fontSize: 16,
        color: '#fefefe',
        paddingRight: 40, // Prevent overlap with icon
    },
      passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#fefefe",
    },
    iconContainer: {
        position: "absolute",
        right: 8,
        top: 8,
    },
    forgotContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 8,
    },
    forgotPassword: {
        alignSelf: "right",
        fontWeight: "bold",
        fontSize: 16,
        textAlign: 'right',
        color: '#fefefe',
        textDecorationLine: 'underline',
        marginTop: 10,
    },
    loginButton: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e50323',
        height: 45,
        borderWidth: 2,
        borderRadius: 14,
        borderColor: "#fefefe",
        marginTop: 10,
        marginBottom: 25,
        alignSelf: "center",
        paddingHorizontal: 30, // Horizontal padding
    },
    /*disabledButton: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e53c50',
        height: 45,
        borderWidth: 2,
        borderRadius: 14,
        borderColor: "#fefefe",
        marginTop: 15,
        marginBottom: 25,
        alignSelf: "center",
        paddingHorizontal: 30, // Horizontal padding
    },*/
    loginButtonText: {
        color: '#fefefe',
        fontSize: 18,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 25,
    },
    signupText: {
        color: '#fefefe',
        fontSize: 16,
    },
    signupLink: {
        fontWeight: "bold",
        color: '#fefefe',
        fontSize: 16,
        textDecorationLine: 'underline',
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fefefe',
        height: 45,
        width: 'auto',
        borderWidth: 1,
        borderColor: '#000000',
        borderRadius: 14,
        marginBottom: 25,
        paddingHorizontal: 15,
    },
    googleIcon: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    googleButtonText: {
        color: '#3c4043',
        fontSize: 16,
    },    
    switchModeButton: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffff",
        alignSelf: "center", // Makes button shrink to fit content
        paddingHorizontal: 16, // Horizontal padding
        paddingVertical: 8, // Vertical padding
        borderRadius: 8, // Added border radius (adjust value as needed)
        borderWidth: 1, // Optional: add border
        borderColor: "#ffffff", // Optional: border color matching text
    },
    switchModeText: {
        color: "#ff3a30",
        includeFontPadding: false, // Removes extra padding around text
        fontSize: 18, // Explicit font size helps with consistent sizing
    },
    resetPasswordText:{
        marginTop: 8,
        marginBottom: 20,
        fontSize: 16,
        color: '#fefefe',
    },
    imagePickerContainer: {
        alignItems: 'center',
        marginVertical: 15,
    },
    imagePicker: {
        width: 160,
        height: 160,
        borderRadius: 90,
        borderWidth: 2,
        borderColor: '#fefefe',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImage: {
        width: "100%",
        height: "100%",
        borderRadius: 90,
    },
});

export const dropdown = StyleSheet.create({
    dropdown: {
      height: 40,
      borderBottomWidth: 1,
      borderBottomColor: '#fefefe',
    },
    placeholderStyle: {
      fontSize: 16,
      color: '#fefefe',
    },
    selectedTextStyle: {
      fontSize: 16,
      color: '#fefefe',
    },
    selectedStyle: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
      marginRight: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: '#fefefe',
    },
    textSelectedStyle: {
      marginRight: 5,
      fontSize: 14,
      color: '#fefefe',
    },
    selectAllButton: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e50323',
        height: 40,
        borderWidth: 1.5,
        borderRadius: 14,
        borderColor: "#fefefe",
        marginTop: 10,
        marginBottom: 15,
        alignSelf: "center",
        paddingHorizontal: 15, // Horizontal padding
    },
    selectAllButtonText: {
        color: '#fefefe',
        fontSize: 15,
    },
})

export const modal = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        },
    modalTitle: {
        fontWeight: "bold",
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
    },
    modalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
    },
    modalButtonText: {
        marginLeft: 10,
        fontSize: 16,
    },
});
export const address = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: "#e50323",
    },
    containerInSAV: {
        flex: 1,
        padding: 20,
        backgroundColor: "#e50323",
    },
    formContainer:{
        flex: 1,
        paddingBottom: 20,
    },
    mapContainer: {
        flex: 0.6,
        width: '100%',
        position: 'relative',
    },
    map:{
        width: '100%',
        height: '100%',
    },
    markerFixed: {
        position: 'absolute',
        left: '50%',
        top: '50%',
        marginLeft: -15,
        marginTop: -42,
        zIndex: 1,
    },
    scrollContainer:{
        flexGrow: 1,
        paddingBottom: 175,
        backgroundColor: "#e50323",
    },
    form:{
        padding: 20,
        borderWidth: 1.5,
        borderRadius: 16,
        borderColor: "#fefefe",
        alignSelf: 'flex-start',
        width: '100%',
    },
    formHeader:{
        fontWeight: "bold",
        fontSize: 22,
        marginBottom: 14,
        textAlign: "center",
        color: '#fefefe',
    },
    inputContainer: {
        marginVertical: 18,
    },
    inputLabel: {
        fontWeight: "bold",
        fontSize: 17,
        marginBottom: 3,
        color: '#fefefe',
    },
    input: {
        height: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#fefefe',
        fontSize: 16,
        color: '#fefefe',
    },
    SaveButton: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e50323',
        height: 45,
        borderWidth: 2,
        borderRadius: 14,
        borderColor: "#fefefe",
        marginVertical: 20,
        alignSelf: "center",
        paddingHorizontal: 30,
    },
    SaveButtonText: {
        color: '#fefefe',
        fontSize: 18,
    },
});
export const international_phone_input = StyleSheet.create({
      container: {
        backgroundColor: '#e50323',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#fefefe',
      },
      flagContainer: {
       //borderTopLeftRadius: 7,
       // borderBottomLeftRadius: 7,
        backgroundColor: '#e50323',
        justifyContent: 'center',
      },
      flag: {},
      caret: {
        color: '#fefefe',
        fontSize: 16,
      },
      divider: {
        backgroundColor: '#fefefe',
      },
      callingCode: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fefefe',
      },
      input: {
        fontSize: 16,
        color: '#fefefe',
      },
});