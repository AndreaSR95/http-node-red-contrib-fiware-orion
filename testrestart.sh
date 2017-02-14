while true 
do
    java Main
        #
            #   TOPIC_ERROR(201, "Missing topic."),
                #   OBJECT_UPLOAD_FAILED(202, "Uploading object failed"),
                    #   OFFSET_COMMIT_FAILED(203, "Failed to upload, offset commit failed"),
                        #   USER_PERMISSION(204, "Failed to upload, user doesn't have the right permissions"),
                            #   OBJECT_STORAGE_CONNECTION_FAILED(205, "Failed to upload, object store connection failed"), 
                                #   SUPERVISOR_FAILURE(206, "Supervisor failed"); 
                                    #
    exitcode=${?}
    echo "exitcode: $exitcode"
    case $exitcode in
    20[1-3])
        echo "sleep short"
        sleep 1
    ;;
    20[4-6])
        echo "sleep long"
        sleep 2
    ;;
    *)
        echo "return code $exitcode, stopping container"
        exit $exitcode
    ;;
    esac

done
