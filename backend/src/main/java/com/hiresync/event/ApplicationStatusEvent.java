package com.hiresync.event;

import com.hiresync.entity.Application;
import org.springframework.context.ApplicationEvent;

public class ApplicationStatusEvent extends ApplicationEvent {
    private final Application application;

    public ApplicationStatusEvent(Object source, Application application) {
        super(source);
        this.application = application;
    }

    public Application getApplication() {
        return application;
    }
}
